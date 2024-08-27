"use client";

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

const mockUsers = [
  {
    id: "1",
    name: "Alice",
    books: [
      {
        id: "1",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        genre: "Fiction",
        isbn: "9780446310789",
        description: "A classic of modern American literature",
        imageUrl: "https://example.com/mockingbird.jpg",
        offeredForExchange: true,
        ownerId: "1",
      },
      {
        id: "2",
        title: "1984",
        author: "George Orwell",
        genre: "Science Fiction",
        isbn: "9780451524935",
        description: "A dystopian social science fiction novel",
        imageUrl: "https://example.com/1984.jpg",
        offeredForExchange: false,
        ownerId: "1",
      },
    ],
    desiredBooks: ["5", "6"],
    likedBooks: [],
  },
  {
    id: "2",
    name: "Bob",
    books: [
      {
        id: "3",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genre: "Fiction",
        isbn: "9780743273565",
        description: "A novel of the Jazz Age",
        imageUrl: "https://example.com/gatsby.jpg",
        offeredForExchange: true,
        ownerId: "2",
      },
      {
        id: "4",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        genre: "Romance",
        isbn: "9780141439518",
        description: "A romantic novel of manners",
        imageUrl: "https://example.com/pride.jpg",
        offeredForExchange: true,
        ownerId: "2",
      },
    ],
    desiredBooks: ["1", "2"],
    likedBooks: [],
  },
  {
    id: "3",
    name: "Charlie",
    books: [
      {
        id: "5",
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        genre: "Fiction",
        isbn: "9780316769174",
        description: "A controversial novel originally published for adults",
        imageUrl: "https://example.com/catcher.jpg",
        offeredForExchange: true,
        ownerId: "3",
      },
      {
        id: "6",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        isbn: "9780547928227",
        description: "A fantasy novel and children's book",
        imageUrl: "https://example.com/hobbit.jpg",
        offeredForExchange: true,
        ownerId: "3",
      },
    ],
    desiredBooks: ["3", "4"],
    likedBooks: [],
  },
];

export default function BookExchange() {
  const [currentUser, setCurrentUser] = useState(mockUsers[0]);
  const [exchangeBooks, setExchangeBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [offerBook, setOfferBook] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);

  useEffect(() => {
    const offeredBooks = mockUsers.flatMap((user) =>
      user.books.filter(
        (book) => book.offeredForExchange && book.ownerId !== currentUser.id,
      ),
    );
    setExchangeBooks(offeredBooks);
    setFilteredBooks(offeredBooks);
  }, [currentUser.id]);

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
        currentUser.desiredBooks.includes(book.id),
      );
    }

    setFilteredBooks(filtered);
  }, [
    searchTerm,
    genreFilter,
    authorFilter,
    showOnlyMatches,
    exchangeBooks,
    currentUser.desiredBooks,
  ]);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    const owner = mockUsers.find((user) => user.id === book.ownerId);
    setSelectedOwner(owner || null);
  };

  const handleExchangeRequest = () => {
    if (selectedBook && offerBook) {
      toast.success(
        `Exchange request sent for "${selectedBook.title}" offering "${currentUser.books.find((b) => b.id === offerBook)?.title}"`,
      );
      setSelectedBook(null);
      setSelectedOwner(null);
      setOfferBook("");
    } else {
      toast.error("Please select a book to offer for exchange");
    }
  };

  const handleLikeBook = (bookId) => {
    setCurrentUser((prevUser) => {
      const updatedLikedBooks = prevUser.likedBooks.includes(bookId)
        ? prevUser.likedBooks.filter((id) => id !== bookId)
        : [...prevUser.likedBooks, bookId];
      return { ...prevUser, likedBooks: updatedLikedBooks };
    });
    toast.success(
      `Book ${currentUser.likedBooks.includes(bookId) ? "unliked" : "liked"}!`,
    );
  };

  const uniqueGenres = Array.from(
    new Set(exchangeBooks.map((book) => book.genre)),
  );
  const uniqueAuthors = Array.from(
    new Set(exchangeBooks.map((book) => book.author)),
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Book Exchange</h1>
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
      <h2 className="text-2xl font-semibold">Books Available for Exchange</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="flex flex-col justify-between">
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
              <Dialog>
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
                            const desiredBook = mockUsers
                              .flatMap((u) => u.books)
                              .find((b) => b.id === desiredBookId);
                            return desiredBook ? (
                              <li key={desiredBook.id}>{desiredBook.title}</li>
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
                            {currentUser.books
                              .filter((book) => book.offeredForExchange)
                              .map((book) => (
                                <SelectItem key={book.id} value={book.id}>
                                  {book.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleExchangeRequest}>
                        Send Exchange Request
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleLikeBook(book.id)}
                className={
                  currentUser.likedBooks.includes(book.id)
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
