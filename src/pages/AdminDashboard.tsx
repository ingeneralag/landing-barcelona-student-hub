import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import { toast } from "@/hooks/use-toast";
import BookingReceipt from "@/components/BookingReceipt";
import {
  LogOut,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Eye,
  Calendar,
  Euro,
  User,
  Mail,
  Phone,
  Download,
  FileText,
  MapPin,
  CreditCard,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import logo from "@/assets/logo1212.png";

type Room = {
  id: number;
  title: string;
  type: string;
  city: string;
  price: number;
  distance: string;
  image: string;
  features: string[];
  available: boolean;
};

type Booking = {
  id: number;
  booking_id: string;
  booking_code?: string;
  room_id: number;
  room_title: string;
  room_city: string;
  room_image?: string;
  room_type?: string;
  room_features?: string[] | string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  payment_date: string;
  payment_intent_id: string | null;
  payment_status: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout, sessionId } = useAuth();
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);
  const [roomToDeleteWithBookings, setRoomToDeleteWithBookings] = useState<{ roomId: number; bookingCount: number } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteBookingId, setDeleteBookingId] = useState<number | null>(null);
  const bookingPrintRef = useRef<HTMLDivElement>(null);
  const [manualBookingForm, setManualBookingForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    totalAmount: "",
    isPaid: false,
  });
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [roomForm, setRoomForm] = useState({
    title: "",
    type: "Individual",
    city: "Barcelona",
    price: "",
    distance: "",
    image: "",
    features: "",
    available: true,
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (isAuthenticated && sessionId) {
      fetchRooms();
      fetchBookings();
    }
  }, [isAuthenticated, sessionId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(username, password);
      setIsLoading(false);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        // Wait a bit for state to update, then fetch data
        setTimeout(() => {
          const currentSessionId = localStorage.getItem("sessionId");
          if (currentSessionId) {
            console.log('Fetching data after login with sessionId:', currentSessionId);
            fetchRooms();
            fetchBookings();
          }
        }, 200);
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Login error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const fetchRooms = async () => {
    setIsLoadingData(true);
    try {
      const currentSessionId = sessionId || localStorage.getItem("sessionId");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
      const timestamp = Date.now();
      const headers: HeadersInit = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      };
      if (currentSessionId) {
        headers.Authorization = `Bearer ${currentSessionId}`;
      }
      const response = await fetch(`${backendUrl}/api/rooms?_t=${timestamp}`, { 
        headers,
        cache: 'no-store', // Prevent browser caching
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({
        title: "Error",
        description: "Failed to fetch rooms",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchBookings = async () => {
    // Try to get sessionId from state or localStorage
    const currentSessionId = sessionId || localStorage.getItem("sessionId");
    
    if (!currentSessionId) {
      console.error('No session ID available');
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      });
      return;
    }

    console.log('Fetching bookings with sessionId:', currentSessionId);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
      const response = await fetch(`${backendUrl}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${currentSessionId}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched bookings:', data);
        setBookings(data);
        if (data.length === 0) {
          toast({
            title: "No bookings",
            description: "No bookings found in the database",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch bookings:', errorData);
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch bookings",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch bookings",
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async (): Promise<string | null> => {
    if (!selectedImageFile) return null;

    const currentSessionId = sessionId || localStorage.getItem("sessionId");
    if (!currentSessionId) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      });
      return null;
    }

    setIsUploadingImage(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
      const formData = new FormData();
      formData.append('image', selectedImageFile);

      const response = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentSessionId}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveRoom = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
      
      // Upload image if a file is selected
      let imageUrl = roomForm.image;
      if (selectedImageFile) {
        const uploadedUrl = await handleUploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          return; // Stop if image upload failed
        }
      }

      if (!imageUrl) {
        toast({
          title: "Error",
          description: "Please provide an image URL or upload an image",
          variant: "destructive",
        });
        return;
      }

      const roomData = {
        title: roomForm.title,
        type: roomForm.type,
        city: roomForm.city,
        price: parseFloat(roomForm.price),
        distance: roomForm.distance,
        image: imageUrl,
        features: roomForm.features.split(",").map((f) => f.trim()).filter(Boolean),
        available: roomForm.available,
      };

      const currentSessionId = sessionId || localStorage.getItem("sessionId");
      if (!currentSessionId) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      let response;
      if (editingRoom) {
        response = await fetch(`${backendUrl}/api/rooms/${editingRoom.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSessionId}`,
          },
          body: JSON.stringify(roomData),
        });
      } else {
        response = await fetch(`${backendUrl}/api/rooms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSessionId}`,
          },
          body: JSON.stringify(roomData),
        });
      }

      if (response.ok) {
        toast({
          title: editingRoom ? "Room updated" : "Room created",
          description: "Room saved successfully",
        });
        setIsRoomDialogOpen(false);
        setEditingRoom(null);
        resetRoomForm();
        setSelectedImageFile(null);
        setImagePreview(null);
        fetchRooms();
      } else {
        throw new Error("Failed to save room");
      }
    } catch (error) {
      console.error("Error saving room:", error);
      toast({
        title: "Error",
        description: "Failed to save room",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoom = async (deleteBookings: boolean = false) => {
    const roomIdToDelete = deleteRoomId || roomToDeleteWithBookings?.roomId;
    if (!roomIdToDelete) return;

    const currentSessionId = sessionId || localStorage.getItem("sessionId");
    if (!currentSessionId) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      });
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
      const url = `${backendUrl}/api/rooms/${roomIdToDelete}${deleteBookings ? '?deleteBookings=true' : ''}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentSessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Room deleted",
          description: data.message || "Room deleted successfully",
        });
        setDeleteRoomId(null);
        setRoomToDeleteWithBookings(null);
        fetchRooms();
        fetchBookings(); // Refresh bookings list
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete room" }));
        
        // Check if the error is due to existing bookings
        if (errorData.hasBookings) {
          setRoomToDeleteWithBookings({
            roomId: roomIdToDelete,
            bookingCount: errorData.bookingCount || 0,
          });
          setDeleteRoomId(null); // Close the first dialog
        } else {
          throw new Error(errorData.error || "Failed to delete room");
        }
      }
    } catch (error: any) {
      console.error("Error deleting room:", error);
      
      // Check if it's a network error or other error
      if (error.message && error.message.includes("Failed to fetch")) {
        toast({
          title: "Network Error",
          description: "Could not connect to server. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to delete room",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportBookings = () => {
    if (bookings.length === 0) {
      toast({
        title: "No bookings",
        description: "There are no bookings to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = [
      "Booking ID",
      "Room Title",
      "Room City",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Check-in",
      "Check-out",
      "Amount (€)",
    ];

    const rows = bookings.map((booking) => [
      booking.booking_id,
      booking.room_title || "N/A",
      booking.room_city || "N/A",
      booking.customer_name,
      booking.customer_email,
      booking.customer_phone,
      format(new Date(booking.check_in), "yyyy-MM-dd"),
      format(new Date(booking.check_out), "yyyy-MM-dd"),
      booking.total_amount,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${bookings.length} booking(s) to CSV`,
    });
  };

  const handleDeleteBooking = async () => {
    if (!deleteBookingId) return;

    const currentSessionId = sessionId || localStorage.getItem("sessionId");
    if (!currentSessionId) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      });
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
      const response = await fetch(`${backendUrl}/api/bookings/${deleteBookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentSessionId}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Booking deleted",
          description: "Booking deleted successfully",
        });
        setDeleteBookingId(null);
        fetchBookings();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete booking" }));
        throw new Error(errorData.error || "Failed to delete booking");
      }
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
        variant: "destructive",
      });
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({
      title: room.title,
      type: room.type,
      city: room.city,
      price: room.price.toString(),
      distance: room.distance,
      image: room.image,
      features: room.features.join(", "),
      available: room.available,
    });
    setSelectedImageFile(null);
    setImagePreview(room.image);
    setIsRoomDialogOpen(true);
  };

  const resetRoomForm = () => {
    setRoomForm({
      title: "",
      type: "Individual",
      city: "Barcelona",
      price: "",
      distance: "",
      image: "",
      features: "",
      available: true,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const openNewRoomDialog = () => {
    setEditingRoom(null);
    resetRoomForm();
    setIsRoomDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage rooms and bookings</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="rooms" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rooms">Rooms Management</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="manual-booking">Manual Booking</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Rooms</h2>
              <Button onClick={openNewRoomDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Room
              </Button>
            </div>

            {isLoadingData ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No rooms found
                        </TableCell>
                      </TableRow>
                    ) : (
                      rooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell>{room.id}</TableCell>
                          <TableCell className="font-medium">{room.title}</TableCell>
                          <TableCell>{room.city}</TableCell>
                          <TableCell>{room.type}</TableCell>
                          <TableCell>{room.price}€</TableCell>
                          <TableCell>
                            {room.available ? (
                              <span className="text-green-600">Yes</span>
                            ) : (
                              <span className="text-red-600">No</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRoom(room)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteRoomId(room.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Bookings</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={fetchBookings} 
                  variant="outline" 
                  className="gap-2"
                  size="sm"
                >
                  <Loader2 className="h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  onClick={handleExportBookings} 
                  variant="outline" 
                  className="gap-2"
                  disabled={bookings.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                   <TableHead>Amount</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow 
                        key={booking.id} 
                        className={`hover:bg-muted/50 ${booking.payment_status === 'failed' ? 'bg-red-50 dark:bg-red-950/20' : ''}`}
                      >
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            {booking.booking_id}
                            {booking.payment_status === 'failed' && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                                Failed
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.room_title}</div>
                            <div className="text-sm text-muted-foreground">{booking.room_city}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.customer_name}</div>
                            <div className="text-sm text-muted-foreground">{booking.customer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(booking.check_in), "PPP")}</TableCell>
                        <TableCell>{format(new Date(booking.check_out), "PPP")}</TableCell>
                        <TableCell className="font-semibold">{booking.total_amount}€</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteBookingId(booking.id)}
                              className="gap-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="manual-booking" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Manual Booking</h2>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Create Booking for Student</CardTitle>
                <CardDescription>
                  Enter student information and select room to create a booking manually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!manualBookingForm.customerName || !manualBookingForm.customerEmail || !manualBookingForm.roomId || !manualBookingForm.checkIn || !manualBookingForm.checkOut || !manualBookingForm.totalAmount) {
                      toast({
                        title: "Error",
                        description: "Please fill all required fields",
                        variant: "destructive",
                      });
                      return;
                    }

                    setIsCreatingBooking(true);
                    try {
                      // Get sessionId from state or localStorage
                      const currentSessionId = sessionId || localStorage.getItem("sessionId");
                      console.log('Manual booking - sessionId from state:', sessionId);
                      console.log('Manual booking - sessionId from localStorage:', localStorage.getItem("sessionId"));
                      console.log('Manual booking - currentSessionId:', currentSessionId);
                      console.log('Manual booking - isAuthenticated:', isAuthenticated);
                      
                      if (!currentSessionId) {
                        toast({
                          title: "Authentication Error",
                          description: "Please log in again. Session expired.",
                          variant: "destructive",
                        });
                        setIsCreatingBooking(false);
                        return;
                      }
                      
                      // If not authenticated, try to check auth first
                      if (!isAuthenticated) {
                        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
                        const checkResponse = await fetch(`${backendUrl}/api/auth/check`, {
                          headers: {
                            Authorization: `Bearer ${currentSessionId}`,
                          },
                        });
                        
                        if (!checkResponse.ok) {
                          toast({
                            title: "Authentication Error",
                            description: "Session expired. Please log in again.",
                            variant: "destructive",
                          });
                          setIsCreatingBooking(false);
                          return;
                        }
                      }

                      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
                      const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;
                      
                      console.log('Manual booking - Making request to:', `${backendUrl}/api/bookings/manual`);
                      console.log('Manual booking - Request body:', {
                        bookingId,
                        roomId: parseInt(manualBookingForm.roomId),
                        customerName: manualBookingForm.customerName,
                        customerEmail: manualBookingForm.customerEmail,
                        customerPhone: manualBookingForm.customerPhone || "",
                        checkIn: manualBookingForm.checkIn,
                        checkOut: manualBookingForm.checkOut,
                        totalAmount: parseFloat(manualBookingForm.totalAmount),
                        paymentStatus: manualBookingForm.isPaid ? "succeeded" : "pending",
                      });
                      
                      const response = await fetch(`${backendUrl}/api/bookings/manual`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${currentSessionId}`,
                        },
                        body: JSON.stringify({
                          bookingId,
                          roomId: parseInt(manualBookingForm.roomId),
                          customerName: manualBookingForm.customerName,
                          customerEmail: manualBookingForm.customerEmail,
                          customerPhone: manualBookingForm.customerPhone || "",
                          checkIn: manualBookingForm.checkIn,
                          checkOut: manualBookingForm.checkOut,
                          totalAmount: parseFloat(manualBookingForm.totalAmount),
                          paymentStatus: manualBookingForm.isPaid ? "succeeded" : "pending",
                        }),
                      });

                      if (response.ok) {
                        const data = await response.json();
                        toast({
                          title: "Success",
                          description: `Booking created successfully! Booking Code: ${data.booking_code || data.booking_id}`,
                        });
                        setManualBookingForm({
                          customerName: "",
                          customerEmail: "",
                          customerPhone: "",
                          roomId: "",
                          checkIn: "",
                          checkOut: "",
                          totalAmount: "",
                          isPaid: false,
                        });
                        fetchBookings();
                      } else {
                        const errorText = await response.text();
                        console.error('Manual booking - Error response:', errorText);
                        let errorData;
                        try {
                          errorData = JSON.parse(errorText);
                        } catch {
                          errorData = { error: errorText || "Failed to create booking" };
                        }
                        throw new Error(errorData.error || `Server error: ${response.status} ${response.statusText}`);
                      }
                    } catch (error: any) {
                      console.error("Error creating booking:", error);
                      toast({
                        title: "Error",
                        description: error.message || "Failed to create booking",
                        variant: "destructive",
                      });
                    } finally {
                      setIsCreatingBooking(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        value={manualBookingForm.customerName}
                        onChange={(e) =>
                          setManualBookingForm({ ...manualBookingForm, customerName: e.target.value })
                        }
                        placeholder="Enter student name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Customer Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={manualBookingForm.customerEmail}
                        onChange={(e) =>
                          setManualBookingForm({ ...manualBookingForm, customerEmail: e.target.value })
                        }
                        placeholder="student@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Customer Phone</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={manualBookingForm.customerPhone}
                        onChange={(e) =>
                          setManualBookingForm({ ...manualBookingForm, customerPhone: e.target.value })
                        }
                        placeholder="+34 123 456 789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomId">Room *</Label>
                      <select
                        id="roomId"
                        value={manualBookingForm.roomId}
                        onChange={(e) => {
                          const selectedRoom = rooms.find((r) => r.id === parseInt(e.target.value));
                          setManualBookingForm({
                            ...manualBookingForm,
                            roomId: e.target.value,
                            totalAmount: selectedRoom ? selectedRoom.price.toString() : manualBookingForm.totalAmount,
                          });
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">Select a room</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.title} - {room.city} ({room.price}€/night)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check-in Date *</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={manualBookingForm.checkIn}
                        onChange={(e) =>
                          setManualBookingForm({ ...manualBookingForm, checkIn: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut">Check-out Date *</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={manualBookingForm.checkOut}
                        onChange={(e) =>
                          setManualBookingForm({ ...manualBookingForm, checkOut: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalAmount">Total Amount (€) *</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        value={manualBookingForm.totalAmount}
                        onChange={(e) =>
                          setManualBookingForm({ ...manualBookingForm, totalAmount: e.target.value })
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2 flex items-end">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isPaid"
                          checked={manualBookingForm.isPaid}
                          onCheckedChange={(checked) =>
                            setManualBookingForm({ ...manualBookingForm, isPaid: checked })
                          }
                        />
                        <Label htmlFor="isPaid" className="cursor-pointer">
                          Payment Received
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setManualBookingForm({
                          customerName: "",
                          customerEmail: "",
                          customerPhone: "",
                          roomId: "",
                          checkIn: "",
                          checkOut: "",
                          totalAmount: "",
                          isPaid: false,
                        });
                      }}
                    >
                      Reset
                    </Button>
                    <Button type="submit" disabled={isCreatingBooking}>
                      {isCreatingBooking ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Booking"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Room Dialog */}
      <Dialog 
        open={isRoomDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedImageFile(null);
            if (!editingRoom) {
              setImagePreview(null);
            }
          }
          setIsRoomDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
            <DialogDescription>
              {editingRoom ? "Update room information" : "Fill in the details to add a new room"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={roomForm.title}
                  onChange={(e) => setRoomForm({ ...roomForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Input
                  id="type"
                  value={roomForm.type}
                  onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={roomForm.city}
                  onChange={(e) => setRoomForm({ ...roomForm, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={roomForm.price}
                  onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance *</Label>
              <Input
                id="distance"
                value={roomForm.distance}
                onChange={(e) => setRoomForm({ ...roomForm, distance: e.target.value })}
                required
              />
            </div>
            
            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Room Image *</Label>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary transition-colors">
                        {isUploadingImage ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : selectedImageFile || imagePreview ? (
                          <span className="text-sm text-muted-foreground">Change Image</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Click to upload image</span>
                        )}
                      </div>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    {selectedImageFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedImageFile.name}
                      </p>
                    )}
                  </div>
                  {(imagePreview || roomForm.image) && (
                    <div className="w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview || roomForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-url">Or enter Image URL</Label>
                <Input
                  id="image-url"
                  value={roomForm.image}
                  onChange={(e) => {
                    setRoomForm({ ...roomForm, image: e.target.value });
                    if (e.target.value) {
                      setImagePreview(e.target.value);
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated) *</Label>
              <Textarea
                id="features"
                value={roomForm.features}
                onChange={(e) => setRoomForm({ ...roomForm, features: e.target.value })}
                placeholder="Wi-Fi incluido, Limpieza semanal, Baño privado"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={roomForm.available}
                onCheckedChange={(checked) => setRoomForm({ ...roomForm, available: checked })}
              />
              <Label htmlFor="available">Available</Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRoomDialogOpen(false);
                setSelectedImageFile(null);
                if (!editingRoom) {
                  setImagePreview(null);
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRoom} disabled={isUploadingImage}>
              {isUploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteRoomId !== null} onOpenChange={() => setDeleteRoomId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteRoom(false)} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Room with Bookings Confirmation */}
      <AlertDialog open={roomToDeleteWithBookings !== null} onOpenChange={() => setRoomToDeleteWithBookings(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Room has associated bookings</AlertDialogTitle>
            <AlertDialogDescription>
              This room has {roomToDeleteWithBookings?.bookingCount || 0} booking(s) associated with it. 
              You can either delete the bookings first from the Bookings tab, or delete the room along with all its bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                // Switch to bookings tab
                const bookingsTab = document.querySelector('[value="bookings"]') as HTMLElement;
                if (bookingsTab) bookingsTab.click();
                setRoomToDeleteWithBookings(null);
              }}
              variant="outline"
            >
              Go to Bookings
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => handleDeleteRoom(true)} 
              className="bg-destructive text-destructive-foreground"
            >
              Delete Room & Bookings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Booking Details Dialog */}
      <Dialog open={selectedBooking !== null} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-5 w-5" />
                  Booking Receipt
                </DialogTitle>
                <DialogDescription className="mt-2">
                  <span className="text-sm font-medium">Booking Code: </span>
                  <span className="font-mono font-semibold">{selectedBooking?.booking_code || selectedBooking?.booking_id}</span>
                </DialogDescription>
              </div>
              {selectedBooking && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (bookingPrintRef.current && selectedBooking) {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        // Clone the content and remove no-print elements
                        const content = bookingPrintRef.current.cloneNode(true) as HTMLElement;
                        const noPrintElements = content.querySelectorAll('.no-print, button, .no-print-button, .animate-ping, .relative > .absolute, .no-print-price');
                        noPrintElements.forEach(el => el.remove());
                        
                        // Remove animation classes
                        content.querySelectorAll('[class*="animate"]').forEach(el => {
                          el.classList.remove('animate-ping', 'animate-spin');
                        });
                        
                        // Convert all images to absolute URLs if they're relative
                        const images = content.querySelectorAll('img');
                        images.forEach(img => {
                          if (img.src && !img.src.startsWith('http') && !img.src.startsWith('data:')) {
                            const src = img.getAttribute('src') || '';
                            if (src.startsWith('/')) {
                              img.src = window.location.origin + src;
                            } else if (!src.startsWith('http')) {
                              img.src = window.location.origin + '/' + src;
                            }
                          }
                        });
                        
                        // Add watermark directly to content
                        const watermarkDiv = document.createElement('div');
                        watermarkDiv.className = 'watermark-logo';
                        watermarkDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); width: 500px; height: 500px; z-index: 0; pointer-events: none; opacity: 1;';
                        content.insertBefore(watermarkDiv, content.firstChild);
                        
                        // Ensure grid classes work in print
                        content.querySelectorAll('[class*="grid"]').forEach(el => {
                          el.classList.add('grid');
                          if (el.classList.contains('md:grid-cols-2') || el.classList.contains('grid-cols-2')) {
                            el.classList.add('grid-cols-2');
                          }
                        });
                        
                        // Convert logo to absolute URL for watermark
                        let logoUrl = '';
                        const headerLogo = document.querySelector('header img[alt*="logo"], header img[alt*="Logo"], header img') as HTMLImageElement;
                        if (headerLogo && headerLogo.src) {
                          logoUrl = headerLogo.src;
                        } else {
                          if (typeof logo === 'string') {
                            if (logo.startsWith('http') || logo.startsWith('data:')) {
                              logoUrl = logo;
                            } else if (logo.startsWith('/')) {
                              logoUrl = window.location.origin + logo;
                            } else {
                              logoUrl = window.location.origin + '/src/assets/logo1212.png';
                            }
                          } else {
                            logoUrl = window.location.origin + '/src/assets/logo1212.png';
                          }
                        }
                        
                        // Add watermark image to the watermark div
                        const watermarkImg = document.createElement('img');
                        watermarkImg.src = logoUrl;
                        watermarkImg.alt = 'Watermark';
                        watermarkImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain; opacity: 0.15;';
                        watermarkImg.onerror = () => {
                          console.error('Failed to load watermark image:', logoUrl);
                        };
                        watermarkImg.onload = () => {
                          console.log('Watermark image loaded successfully:', logoUrl);
                        };
                        
                        const watermarkDivInContent = content.querySelector('.watermark-logo');
                        if (watermarkDivInContent) {
                          watermarkDivInContent.appendChild(watermarkImg);
                        }

                        // Get the full CSS from BookingSuccess (copy the entire style block)
                        printWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <title>Booking Receipt - ${selectedBooking.booking_id}</title>
                              <meta charset="utf-8">
                              <style>
                                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                                
                                * {
                                  margin: 0;
                                  padding: 0;
                                  box-sizing: border-box;
                                }
                                
                                :root {
                                  --background: 0 0% 100%;
                                  --foreground: 24 35% 20%;
                                  --card: 0 0% 100%;
                                  --card-foreground: 215 25% 27%;
                                  --muted: 24 30% 97%;
                                  --muted-foreground: 24 15% 40%;
                                  --primary: 24 90% 54%;
                                  --primary-foreground: 0 0% 100%;
                                  --border: 24 20% 88%;
                                  --radius: 0.75rem;
                                }
                                
                                body {
                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Inter', sans-serif;
                                  padding: 20px;
                                  color: hsl(var(--foreground));
                                  background: hsl(var(--background));
                                  line-height: 1.6;
                                  font-size: 14px;
                                  -webkit-font-smoothing: antialiased;
                                  -moz-osx-font-smoothing: grayscale;
                                }
                                
                                .print-container {
                                  max-width: 800px;
                                  margin: 0 auto;
                                  background: white;
                                }
                                
                                /* Typography */
                                h1, h2, h3, h4, h5, h6 {
                                  font-weight: 600;
                                  line-height: 1.2;
                                  margin-bottom: 0.5rem;
                                  color: hsl(var(--foreground));
                                }
                                
                                h2 { font-size: 1.5rem; }
                                h3 { font-size: 1.25rem; }
                                h4 { font-size: 1.125rem; }
                                h5 { font-size: 1rem; }
                                
                                p {
                                  margin-bottom: 0.5rem;
                                  line-height: 1.6;
                                }
                                
                                /* Text sizes */
                                .text-xs { font-size: 0.75rem; line-height: 1rem; }
                                .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
                                .text-base { font-size: 1rem; line-height: 1.5rem; }
                                .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
                                .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
                                .text-2xl { font-size: 1.5rem; line-height: 2rem; }
                                
                                /* Font weights */
                                .font-medium { font-weight: 500; }
                                .font-semibold { font-weight: 600; }
                                .font-bold { font-weight: 700; }
                                .font-mono {
                                  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                                }
                                
                                /* Colors */
                                .text-muted-foreground { color: hsl(var(--muted-foreground)); }
                                .text-primary { color: hsl(var(--primary)); }
                                .text-green-500 { color: rgb(34, 197, 94); }
                                .text-green-600 { color: rgb(22, 163, 74); }
                                .text-red-600 { color: rgb(220, 38, 38); }
                                
                                /* Layout */
                                .flex { display: flex; }
                                .flex-col { flex-direction: column; }
                                .flex-row { flex-direction: row; }
                                .flex-wrap { flex-wrap: wrap; }
                                .flex-1 { flex: 1 1 0%; }
                                .flex-shrink-0 { flex-shrink: 0; }
                                .items-center { align-items: center; }
                                .items-start { align-items: flex-start; }
                                .justify-between { justify-content: space-between; }
                                .text-right { text-align: right; }
                                .text-center { text-align: center; }
                                
                                /* Spacing */
                                .gap-2 { gap: 0.5rem; }
                                .gap-4 { gap: 1rem; }
                                .gap-6 { gap: 1.5rem; }
                                .space-y-1 > * + * { margin-top: 0.25rem; }
                                .space-y-2 > * + * { margin-top: 0.5rem; }
                                .space-y-4 > * + * { margin-top: 1rem; }
                                .space-y-6 > * + * { margin-top: 1.5rem; }
                                
                                .mb-1 { margin-bottom: 0.25rem; }
                                .mb-2 { margin-bottom: 0.5rem; }
                                .mb-3 { margin-bottom: 0.75rem; }
                                .mb-4 { margin-bottom: 1rem; }
                                .mt-1 { margin-top: 0.25rem; }
                                .mt-2 { margin-top: 0.5rem; }
                                .mt-3 { margin-top: 0.75rem; }
                                .mt-4 { margin-top: 1rem; }
                                .pt-3 { padding-top: 0.75rem; }
                                .pt-4 { padding-top: 1rem; }
                                .pb-4 { padding-bottom: 1rem; }
                                .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
                                .px-4 { padding-left: 1rem; padding-right: 1rem; }
                                .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                                .p-4 { padding: 1rem; }
                                
                                /* Grid */
                                .grid { display: grid; }
                                .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
                                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                                
                                /* Borders */
                                .border { border: 1px solid hsl(var(--border)); }
                                .border-t { border-top: 1px solid hsl(var(--border)); }
                                .border-b { border-bottom: 1px solid hsl(var(--border)); }
                                .rounded { border-radius: 0.25rem; }
                                .rounded-lg { border-radius: 0.5rem; }
                                
                                /* Backgrounds */
                                .bg-muted { background-color: hsl(var(--muted)); }
                                .bg-yellow-50 { background-color: #fefce8; }
                                .bg-green-50 { background-color: #f0fdf4; }
                                
                                /* Width/Height */
                                .w-full { width: 100%; }
                                .w-32 { width: 8rem; }
                                .h-32 { height: 8rem; }
                                .h-4 { height: 1rem; }
                                .w-4 { width: 1rem; }
                                
                                /* Object fit */
                                .object-cover { object-fit: cover; }
                                
                                /* Images */
                                img {
                                  max-width: 100%;
                                  height: auto;
                                  display: block;
                                  border-radius: 0.5rem;
                                }
                                
                                /* Icons */
                                svg {
                                  display: inline-block;
                                  width: 1rem;
                                  height: 1rem;
                                  vertical-align: middle;
                                  flex-shrink: 0;
                                }
                                
                                /* Container */
                                .container {
                                  width: 100%;
                                  max-width: 56rem;
                                  margin-left: auto;
                                  margin-right: auto;
                                }
                                
                                .max-w-4xl {
                                  max-width: 56rem;
                                }
                                
                                .mx-auto {
                                  margin-left: auto;
                                  margin-right: auto;
                                }
                                
                                /* Card styles */
                                .card {
                                  border: 1px solid hsl(var(--border));
                                  border-radius: calc(var(--radius) - 2px);
                                  background-color: hsl(var(--card));
                                  color: hsl(var(--card-foreground));
                                  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                                }
                                
                                .card-header {
                                  padding: 1.5rem;
                                  border-bottom: 1px solid hsl(var(--border));
                                }
                                
                                .card-content {
                                  padding: 1.5rem;
                                }
                                
                                .card-title {
                                  font-size: 1.5rem;
                                  font-weight: 600;
                                  line-height: 1.2;
                                }
                                
                                .card-description {
                                  font-size: 0.875rem;
                                  color: hsl(var(--muted-foreground));
                                  margin-top: 0.5rem;
                                }
                                
                                /* Responsive */
                                @media (min-width: 640px) {
                                  .sm\\:flex-row { flex-direction: row; }
                                  .sm\\:items-center { align-items: center; }
                                  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                                }
                                
                                /* Print specific */
                                @media print {
                                  @page {
                                    size: A4;
                                    margin: 1cm;
                                  }
                                  
                                  body {
                                    padding: 0;
                                    font-size: 10pt;
                                    background: white !important;
                                    color: black !important;
                                    position: relative;
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                  }
                                  
                                  .watermark-logo {
                                    position: fixed !important;
                                    top: 50% !important;
                                    left: 50% !important;
                                    transform: translate(-50%, -50%) rotate(-45deg) !important;
                                    width: 500px !important;
                                    height: 500px !important;
                                    z-index: 0 !important;
                                    pointer-events: none !important;
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                    color-adjust: exact !important;
                                    page-break-inside: avoid !important;
                                    display: block !important;
                                    visibility: visible !important;
                                  }
                                  
                                  .watermark-logo img {
                                    width: 100% !important;
                                    height: 100% !important;
                                    object-fit: contain !important;
                                    opacity: 0.15 !important;
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                    color-adjust: exact !important;
                                    display: block !important;
                                    visibility: visible !important;
                                  }
                                  
                                  body::before {
                                    display: none !important;
                                  }
                                  
                                  * {
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                    color-adjust: exact !important;
                                  }
                                  
                                  .print-container {
                                    max-width: 100%;
                                    margin: 0;
                                    position: relative;
                                    z-index: 1;
                                  }
                                  
                  .no-print-price {
                    display: none !important;
                  }
                  
                  .print-booking-code {
                    display: block !important;
                    visibility: visible !important;
                    font-size: 0.9rem !important;
                    margin-bottom: 0.5rem !important;
                  }
                  
                  .print-booking-code strong {
                    font-weight: 600 !important;
                  }
                  
                  .print-booking-code .font-mono {
                    font-size: 1rem !important;
                    font-weight: 700 !important;
                    color: hsl(var(--foreground)) !important;
                  }
                                  
                                  /* Reduce spacing for compact layout */
                                  .space-y-6 > * + * {
                                    margin-top: 0.75rem !important;
                                  }
                                  
                                  .space-y-4 > * + * {
                                    margin-top: 0.5rem !important;
                                  }
                                  
                                  .space-y-2 > * + * {
                                    margin-top: 0.25rem !important;
                                  }
                                  
                                  .mb-4 {
                                    margin-bottom: 0.5rem !important;
                                  }
                                  
                                  .mb-3 {
                                    margin-bottom: 0.4rem !important;
                                  }
                                  
                                  .mb-2 {
                                    margin-bottom: 0.3rem !important;
                                  }
                                  
                                  .mt-4 {
                                    margin-top: 0.5rem !important;
                                  }
                                  
                                  .mt-3 {
                                    margin-top: 0.4rem !important;
                                  }
                                  
                                  .pt-4 {
                                    padding-top: 0.5rem !important;
                                  }
                                  
                                  .pb-4 {
                                    padding-bottom: 0.5rem !important;
                                  }
                                  
                                  .p-4 {
                                    padding: 0.75rem !important;
                                  }
                                  
                                  /* Reduce font sizes slightly */
                                  .text-sm {
                                    font-size: 0.8rem !important;
                                    line-height: 1.3 !important;
                                  }
                                  
                                  .text-xs {
                                    font-size: 0.7rem !important;
                                    line-height: 1.2 !important;
                                  }
                                  
                                  h4 {
                                    font-size: 1rem !important;
                                    margin-bottom: 0.4rem !important;
                                  }
                                  
                                  h5 {
                                    font-size: 0.9rem !important;
                                    margin-bottom: 0.3rem !important;
                                  }
                                  
                                  /* Compact card styles */
                                  .card {
                                    page-break-inside: avoid;
                                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                                    border: 1px solid #e5e7eb !important;
                                    background: white !important;
                                    position: relative;
                                    z-index: 1;
                                    margin-bottom: 0.75rem !important;
                                  }
                                  
                                  /* Reduce image size */
                                  .w-32 {
                                    width: 6rem !important;
                                  }
                                  
                                  .h-32 {
                                    height: 6rem !important;
                                  }
                                  
                                  /* Compact grid */
                                  .gap-4 {
                                    gap: 0.75rem !important;
                                  }
                                  
                                  h1, h2, h3, h4 {
                                    page-break-after: avoid;
                                    page-break-inside: avoid;
                                  }
                                  
                                  img {
                                    page-break-inside: avoid;
                                    max-width: 100%;
                                    height: auto;
                                  }
                                  
                                  .border {
                                    border-color: #e5e7eb !important;
                                  }
                                  
                                  .bg-yellow-50 {
                                    background-color: #fefce8 !important;
                                    border: 1px solid #eab308 !important;
                                  }
                                  
                                  .bg-green-50 {
                                    background-color: #f0fdf4 !important;
                                    border: 1px solid #22c55e !important;
                                  }
                                  
                                  /* Prevent page breaks */
                                  .border-b {
                                    padding-bottom: 0.5rem !important;
                                    margin-bottom: 0.5rem !important;
                                  }
                                  
                  .border-t {
                    padding-top: 0.5rem !important;
                    margin-top: 0.5rem !important;
                  }
                  
                  /* Contact Information in Print */
                  a {
                    color: hsl(var(--primary)) !important;
                    text-decoration: underline !important;
                  }
                  
                  a[href^="mailto:"],
                  a[href^="http"] {
                    color: hsl(var(--primary)) !important;
                    word-break: break-all !important;
                  }
                }
                              </style>
                            </head>
                            <body style="-webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; position: relative;">
                              <div class="watermark-logo" style="position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) rotate(-45deg) !important; width: 500px !important; height: 500px !important; z-index: 0 !important; pointer-events: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; display: block !important; visibility: visible !important; opacity: 1 !important;">
                                <img src="${logoUrl}" alt="Watermark" style="width: 100% !important; height: 100% !important; object-fit: contain !important; opacity: 0.15 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; display: block !important; visibility: visible !important;" onload="console.log('Watermark image loaded');" onerror="console.error('Watermark image failed to load:', this.src);" />
                              </div>
                              <div class="print-container" style="position: relative; z-index: 1; background: white;">
                                ${content.innerHTML}
                              </div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => {
                          printWindow.print();
                        }, 500);
                      }
                    }
                  }}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedBooking && (
            <div ref={bookingPrintRef}>
              <BookingReceipt
                bookingCode={selectedBooking.booking_code || selectedBooking.booking_id}
                totalAmount={selectedBooking.total_amount}
                nights={Math.ceil(
                  (new Date(selectedBooking.check_out).getTime() -
                    new Date(selectedBooking.check_in).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
                roomTitle={selectedBooking.room_title || "N/A"}
                roomCity={selectedBooking.room_city || "N/A"}
                roomType={selectedBooking.room_type || "Room"}
                roomImage={selectedBooking.room_image}
                roomFeatures={
                  Array.isArray(selectedBooking.room_features)
                    ? selectedBooking.room_features
                    : typeof selectedBooking.room_features === 'string'
                    ? JSON.parse(selectedBooking.room_features || '[]')
                    : []
                }
                checkIn={selectedBooking.check_in}
                checkOut={selectedBooking.check_out}
                customerName={selectedBooking.customer_name}
                customerEmail={selectedBooking.customer_email}
                customerPhone={selectedBooking.customer_phone}
                paymentStatus={selectedBooking.payment_status}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Booking Confirmation */}
      <AlertDialog open={deleteBookingId !== null} onOpenChange={() => setDeleteBookingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBooking}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;

