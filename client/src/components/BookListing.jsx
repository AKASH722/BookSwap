import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import { z } from "zod";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext.jsx";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.string().optional(),
  isbn: z.string().min(10, "ISBN must be at least 10 characters").optional(),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
});

export default function BookListing() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const { fetchUserData } = useAuth();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({ ...prev, [name]: value }));
  };

  const fetchBooksFromBackend = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/book`,
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
        error.response.data.message || "Failed to fetch books from the server.",
      );
    }
  };

  const fetchBookDetails = useCallback(async (query) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes`,
        {
          params: { q: query },
        },
      );
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching book details:", error);
      return [];
    }
  }, []);

  const searchBooks = useCallback(
    debounce(async (query) => {
      if (query === "") setSearchResults([]);
      if (query.length < 3) return;
      const results = await fetchBookDetails(query);
      setSearchResults(results);
    }, 300),
    [fetchBookDetails],
  );
  useEffect(() => {
    fetchBooksFromBackend();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      searchBooks(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, searchBooks]);

  useEffect(() => {
    if (newBook.title || newBook.isbn) {
      fetchBookDetails(newBook.isbn || newBook.title).then((items) =>
        setSuggestions(items),
      );
    }
  }, [newBook.title, newBook.isbn, fetchBookDetails]);

  const validateBook = (book) => {
    try {
      bookSchema.parse(book);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const addBook = async () => {
    if (!validateBook(newBook)) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/book`,
        newBook,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Include token in header
          },
        },
      );

      setBooks((prev) => [...prev, response.data.data]); // Adjust according to the response structure
      setNewBook({});
      setIsDialogOpen(false);
      toast.success("Book added successfully!");
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Failed to add the book.");
    }
  };

  const editBook = (id) => {
    setEditingId(id);
    const bookToEdit = books.find((book) => book._id === id);
    if (bookToEdit) {
      setNewBook(bookToEdit);
      setIsDialogOpen(true);
    }
  };

  const updateBook = async () => {
    if (!validateBook(newBook)) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/book/${editingId}`,
        newBook,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Include token in header
          },
        },
      );

      setBooks((prev) =>
        prev.map((book) =>
          book._id === editingId ? { ...newBook, id: editingId } : book,
        ),
      );
      setNewBook({});
      setEditingId(null);
      setIsDialogOpen(false);
      toast.success("Book updated successfully!");
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update the book.");
    }
  };

  const removeBook = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/book/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Include token in header
        },
      });

      setBooks((prev) => prev.filter((book) => book._id !== id));
      toast.success("Book removed successfully!");
    } catch (error) {
      console.error("Error removing book:", error);
      toast.error("Failed to remove the book.");
    }
  };

  const selectSuggestion = (book) => {
    setNewBook({
      title: book.volumeInfo.title || "",
      author: book.volumeInfo.authors?.[0] || "",
      genre: book.volumeInfo.categories?.[0] || "",
      isbn: book.volumeInfo.industryIdentifiers?.[0]?.identifier || "",
      description: book.volumeInfo.description || "",
      imageUrl: book.volumeInfo.imageLinks?.thumbnail || "",
    });
    setSuggestions([]);
  };

  const addBookFromSearch = async (book) => {
    const newBook = {
      title: book.volumeInfo.title || "",
      author: book.volumeInfo.authors?.[0] || "",
      genre: book.volumeInfo.categories?.[0] || "",
      isbn: book.volumeInfo.industryIdentifiers?.[0]?.identifier || "",
      description: book.volumeInfo.description || "",
      imageUrl: book.volumeInfo.imageLinks?.thumbnail || "",
      isOffered: false,
    };

    if (!validateBook(newBook)) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/book`,
        newBook,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Include token in header
          },
        },
      );

      setBooks((prev) => [...prev, response.data.data]); // Adjust according to the response structure
      toast.success("Book added successfully!");
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Failed to add the book.");
    }
  };

  const toggleExchangeOffer = async (id) => {
    const updatedBooks = books.map((book) =>
      book._id === id ? { ...book, isOffered: !book.isOffered } : book,
    );

    try {
      const book = updatedBooks.find((b) => b._id === id);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/book/${id}`,
        book,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Include token in header
          },
        },
      );

      fetchUserData();
      setBooks(updatedBooks);
      toast.success("Exchange offer status updated successfully!");
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update the exchange offer status.");
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm),
  );

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search by title, author, or ISBN"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Book</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Book" : "Add New Book"}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={newBook.title || ""}
                  onChange={handleInputChange}
                  placeholder="Enter book title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  value={newBook.author || ""}
                  onChange={handleInputChange}
                  placeholder="Enter author name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  name="genre"
                  value={newBook.genre || ""}
                  onChange={handleInputChange}
                  placeholder="Enter genre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={newBook.isbn || ""}
                  onChange={handleInputChange}
                  placeholder="Enter ISBN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newBook.description || ""}
                  onChange={handleInputChange}
                  placeholder="Enter book description"
                />
              </div>
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <Label>Suggestions</Label>
                  <ul className="border rounded-md divide-y max-h-40 overflow-auto">
                    {suggestions.slice(0, 5).map((book) => (
                      <li
                        key={book._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectSuggestion(book)}
                      >
                        {book.volumeInfo.title} by{" "}
                        {book.volumeInfo.authors?.[0]}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button type="button" onClick={editingId ? updateBook : addBook}>
                {editingId ? "Update Book" : "Add Book"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {searchResults.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Search Results:</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {searchResults.map((book) => (
              <Card key={book._id} className="flex flex-col justify-between">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">
                    {book.volumeInfo.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs">{book.volumeInfo.authors?.[0]}</p>
                  {book.volumeInfo.imageLinks?.thumbnail && (
                    <img
                      src={book.volumeInfo.imageLinks.thumbnail}
                      alt={book.volumeInfo.title}
                      className="mt-2 w-full h-32 object-cover"
                    />
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button size="sm" onClick={() => addBookFromSearch(book)}>
                    Add
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

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
              <p className="text-sm">
                {book.description && book.description.length > 100
                  ? `${book.description.substring(0, 100)}...`
                  : book.description}
              </p>
              {book.imageUrl && (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="mt-2 w-full h-32 object-scale-down"
                />
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id={`exchange-${book._id}`}
                  checked={book.isOffered}
                  onCheckedChange={() => toggleExchangeOffer(book._id)}
                />
                <Label htmlFor={`exchange-${book._id}`}>
                  Offer for exchange
                </Label>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button size="sm" onClick={() => editBook(book._id)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeBook(book._id)}
              >
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
