import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import axios from "axios";

export default function BookExchange() {
  const [exchangeBooks, setExchangeBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [offerBook, setOfferBook] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const [books, setBooks] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/book/all-offered`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        );

        setBooks(response.data.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error(
          error.response.data.message ||
            "Failed to fetch books from the server.",
        );
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    setExchangeBooks(books);
    setFilteredBooks(books);
  }, [user, books]);

  useEffect(() => {
    let filtered = exchangeBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm),
    );

    if (genreFilter) {
      filtered = filtered.filter((book) => book.genre === genreFilter);
    }

    if (authorFilter) {
      filtered = filtered.filter((book) => book.author === authorFilter);
    }

    if (showOnlyMatches) {
      filtered = filtered.filter((book) =>
        user.desiredBooks.includes(book._id),
      );
    }

    setFilteredBooks(filtered);
  }, [
    searchTerm,
    genreFilter,
    authorFilter,
    showOnlyMatches,
    exchangeBooks,
    user?.desiredBooks,
  ]);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    const owner = book.ownedBy;
    setSelectedOwner(owner || null);
  };

  const handleExchangeRequest = async () => {
    if (selectedBook && offerBook) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/exchange`,
          {
            bookRequestedId: selectedBook._id,
            bookOfferedId: offerBook,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        );

        toast.success(
          response.data.message || "Exchange request sent successfully!",
        );
      } catch (error) {
        console.error("Error sending exchange request:", error);
        toast.error(
          error.response?.data?.message || "Failed to send exchange request",
        );
      } finally {
        setSelectedBook(null);
        setSelectedOwner(null);
        setOfferBook("");
      }
    } else {
      toast.error("Please select a book to offer for exchange");
    }
  };

  const handleDesiredBooksChange = async (bookId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/book/${bookId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      user.desiredBooks = response.data.data;

      toast.success(response.data.message);
    } catch (error) {
      console.error("Error toggling desired book status:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update desired book status.",
      );
    }
  };

  const uniqueGenres = Array.from(
    new Set(exchangeBooks.map((book) => book.genre)),
  );
  const uniqueAuthors = Array.from(
    new Set(exchangeBooks.map((book) => book.author)),
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <Input
          type="text"
          placeholder="Search by title, author, or ISBN"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex space-x-2">
          <Select
            value={genreFilter}
            onValueChange={(e) => setGenreFilter(e === "all" ? "" : e)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {uniqueGenres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={authorFilter}
            onValueChange={(e) => setAuthorFilter(e === "all" ? "" : e)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {uniqueAuthors.map((author) => (
                <SelectItem key={author} value={author}>
                  {author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-matches"
            checked={showOnlyMatches}
            onCheckedChange={(checked) => setShowOnlyMatches(checked)}
          />
          <Label htmlFor="show-matches">Find My Matches</Label>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBooks.map((book) => (
          <Card key={book._id} className="flex flex-col justify-between">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{book.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm">
                <strong>Author:</strong> {book.author}
              </p>
              <p className="text-sm">
                <strong>Genre:</strong> {book.genre}
              </p>
              <p className="text-sm">
                <strong>ISBN:</strong> {book.isbn}
              </p>
              {book.imageUrl && (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="mt-2 w-full h-32 object-cover"
                />
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Dialog open={selectedBook && selectedOwner}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleBookSelect(book)}>
                    Request Exchange
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Exchange Request</DialogTitle>
                  </DialogHeader>
                  {selectedBook && selectedOwner && (
                    <div className="space-y-4">
                      <p>
                        <strong>Book:</strong> {selectedBook.title} by{" "}
                        {selectedBook.author}
                      </p>
                      <p>
                        <strong>Owner:</strong> {selectedOwner.name}
                      </p>
                      <div>
                        <h3 className="font-semibold mb-2">
                          Owner's Desired Books:
                        </h3>
                        <ul className="list-disc pl-5">
                          {selectedOwner.desiredBooks.map((desiredBookId) => {
                            const desiredBook = books.find(
                              (b) => b._id === desiredBookId,
                            );
                            return desiredBook ? (
                              <li key={desiredBook._id}>{desiredBook.title}</li>
                            ) : null;
                          })}
                        </ul>
                      </div>
                      <div>
                        <Label
                          htmlFor="offerBook"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Select a book to offer:
                        </Label>
                        <Select onValueChange={setOfferBook} value={offerBook}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a book" />
                          </SelectTrigger>
                          <SelectContent>
                            {user.ownedBooks
                              .filter((book) => book.isOffered)
                              .map((book) => (
                                <SelectItem key={book._id} value={book._id}>
                                  {book.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" onClick={handleExchangeRequest}>
                        Send Exchange Request
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDesiredBooksChange(book._id)}
                className={
                  user?.desiredBooks.includes(book._id)
                    ? "text-red-500"
                    : "text-gray-500"
                }
              >
                <Heart className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
