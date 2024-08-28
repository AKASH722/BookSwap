import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Heart } from "lucide-react";
import axios from "axios";

export default function DesiredBooks() {
  const [desiredBooks, setDesiredBooks] = useState([]);

  useEffect(() => {
    const fetchDesiredBooks = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/book/desired`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        );
        console.log(response.data.data);
        setDesiredBooks(response.data.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to fetch books from the server.",
        );
      }
    };
    fetchDesiredBooks();
  }, []);

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

      setDesiredBooks(response.data.data);

      toast.success(response.data.message);
    } catch (error) {
      console.error("Error toggling desired book status:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update desired book status.",
      );
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="space-y-4">
        {desiredBooks.length === 0 ? (
          <p>You haven't added any desired books yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {desiredBooks.map((book) => (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDesiredBooksChange(book._id)}
                    className={"text-red-500"}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
