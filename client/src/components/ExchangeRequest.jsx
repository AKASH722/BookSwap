import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRightLeft, CheckCircle, History, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext.jsx";

export default function ExchangeRequest() {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const [incomingRes, outgoingRes, historyRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/exchange/received`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            },
          ),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/exchange/sent`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/exchange/history`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            },
          ),
        ]);

        setIncomingRequests(incomingRes.data.data);
        setOutgoingRequests(outgoingRes.data.data);
        const transformedHistory = historyRes.data.data.map((exchange) => ({
          id: exchange._id,
          exchangePartner:
            exchange.requester._id !== user._id
              ? exchange.requester.username
              : exchange.requestee.username,
          givenBook:
            exchange.requester._id === user._id
              ? {
                  title: exchange.bookOffered.title,
                  author: exchange.bookOffered.author,
                }
              : {
                  title: exchange.bookRequested.title,
                  author: exchange.bookRequested.author,
                },
          receivedBook:
            exchange.requester._id !== user._id
              ? {
                  title: exchange.bookOffered.title,
                  author: exchange.bookOffered.author,
                }
              : {
                  title: exchange.bookRequested.title,
                  author: exchange.bookRequested.author,
                },
          date: new Date(exchange.createdAt).toISOString().split("T")[0],
          status: exchange.status,
        }));

        setExchangeHistory(transformedHistory);
      } catch (error) {
        console.error("Error fetching exchange data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/exchange/status`,
        { requestId: id, status: "accepted" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      incomingRequests.find((request) => request._id === id);
      setIncomingRequests((requests) =>
        requests.map((request) =>
          request._id === id ? { ...request, status: "accepted" } : request,
        ),
      );
      toast.success("Request accepted!");
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request.");
    }
  };
  const handleReject = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/exchange/status`,
        { requestId: id, status: "rejected" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      setIncomingRequests((requests) =>
        requests.map((request) =>
          request._id === id ? { ...request, status: "rejected" } : request,
        ),
      );
      toast.error("Request rejected.");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request.");
    }
  };

  const RequestCard = ({ request, isIncoming }) => (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Exchange Request
        </CardTitle>
        <CardDescription className="text-sm">
          {isIncoming
            ? `From: ${request.requester.username}`
            : `To: ${request.requestee.username}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2 text-sm">
          <div>
            <h3 className="font-semibold">Requested:</h3>
            <p>
              {request.bookRequested.title} by {request.bookRequested.author}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Offered:</h3>
            <p>
              {request.bookOffered.title} by {request.bookOffered.author}
            </p>
          </div>
          <p className="text-muted-foreground">Status: {request.status}</p>
        </div>
      </CardContent>
      {isIncoming && request.status === "pending" && (
        <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => handleAccept(request._id)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => handleReject(request._id)}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  const HistoryCard = ({ exchange }) => (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          {exchange.status === "accepted"
            ? "Accepted Exchange"
            : "Rejected Exchange"}
        </CardTitle>
        <CardDescription className="text-sm">
          With: {exchange.exchangePartner} on {exchange.date}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2 text-sm">
          <div>
            <h3 className="font-semibold">Given:</h3>
            <p>
              {exchange.givenBook.title} by {exchange.givenBook.author}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Received:</h3>
            <p>
              {exchange.receivedBook.title} by {exchange.receivedBook.author}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Exchange Requests</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="incoming" className="text-xs sm:text-sm">
              Incoming
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="text-xs sm:text-sm">
              Outgoing
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="incoming">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {incomingRequests.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  isIncoming={true}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="outgoing">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {outgoingRequests.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  isIncoming={false}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exchangeHistory.map((exchange) => (
                <HistoryCard key={exchange.id} exchange={exchange} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
