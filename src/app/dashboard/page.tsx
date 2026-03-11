"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { FoodCard } from "@/components/food-card";
import { useAuth } from "@/hooks/use-auth";
import { useListings, useCreateListing } from "@/hooks/use-listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Store, Clock, PackageOpen } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertFoodListingSchema } from "@shared/schema";
import { z } from "zod";

// Create a specific schema for the form
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  originalPrice: z.coerce.number().min(0, "Price cannot be negative"),
  expiryTimestamp: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  pickupWindow: z.string().min(3, "Example: '2 PM - 5 PM'"),
  isDonation: z.boolean().default(false),
});

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useAuth();
  const { data: listings, isLoading: listingsLoading } = useListings();
  const createMutation = useCreateListing();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  // Redirect if not Provider
  if (!userLoading && user && user.role !== "Provider") {
    router.push("/");
    return null;
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: 1,
    originalPrice: 10.00,
    expiryTimestamp: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
    pickupWindow: "5 PM - 7 PM",
    isDonation: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = formSchema.parse(formData);
      createMutation.mutate({
        ...validated,
        expiryTimestamp: new Date(validated.expiryTimestamp),
        providerId: user!.id // backend ignores, but satisfying typescript
      }, {
        onSuccess: () => {
          setOpen(false);
        }
      });
    } catch (err: any) {
      alert("Validation failed. Please check inputs.");
    }
  };

  const myListings = listings?.filter(l => l.providerId === user?.id) || [];

  if (userLoading || listingsLoading) return <Layout><div className="animate-pulse h-96 bg-muted rounded-2xl" /></Layout>;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Provider Dashboard</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Store className="w-4 h-4" /> {user?.name}
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 px-6 shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
              <Plus className="w-5 h-5 mr-2" />
              List Surplus Food
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-0">
            <div className="bg-gradient-to-br from-emerald-500 to-primary p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display text-white">Create New Listing</DialogTitle>
                <DialogDescription className="text-emerald-100">
                  Help reduce waste by listing your surplus food. It will be immediately available to the community.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. 5 Boxes of Assorted Pastries" 
                    className="rounded-xl bg-background"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="What's included? Any allergens?" 
                    className="rounded-xl bg-background resize-none h-24"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (portions)</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      min="1" 
                      className="rounded-xl bg-background"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price ($)</Label>
                    <Input 
                      id="originalPrice" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      className="rounded-xl bg-background"
                      value={formData.originalPrice}
                      onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})}
                      disabled={formData.isDonation}
                      required={!formData.isDonation}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Time</Label>
                    <Input 
                      id="expiry" 
                      type="datetime-local" 
                      className="rounded-xl bg-background"
                      value={formData.expiryTimestamp}
                      onChange={e => setFormData({...formData, expiryTimestamp: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup">Pickup Window</Label>
                    <Input 
                      id="pickup" 
                      placeholder="e.g. 5:00 PM - 6:30 PM" 
                      className="rounded-xl bg-background"
                      value={formData.pickupWindow}
                      onChange={e => setFormData({...formData, pickupWindow: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <Checkbox 
                    id="donation" 
                    checked={formData.isDonation}
                    onCheckedChange={(checked) => setFormData({...formData, isDonation: checked as boolean, originalPrice: checked ? 0 : formData.originalPrice})}
                  />
                  <div className="space-y-1 leading-none">
                    <label htmlFor="donation" className="text-sm font-medium leading-none text-emerald-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      List as Donation (Free)
                    </label>
                    <p className="text-xs text-emerald-700">Perfect for NGOs and shelters</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} className="rounded-xl shadow-lg shadow-primary/20">
                  {createMutation.isPending ? "Publishing..." : "Publish Listing"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <PackageOpen className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
          <h3 className="text-3xl font-display font-bold text-foreground">{myListings.length}</h3>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-primary flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
          <h3 className="text-3xl font-display font-bold text-foreground">
            {myListings.filter(l => l.status === 'Available').length}
          </h3>
        </div>
      </div>

      <h2 className="text-2xl font-display font-bold mb-6">Your Recent Listings</h2>
      {myListings.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-3xl border border-border/50 shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-display font-bold mb-2">No listings yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Start adding your surplus food items to connect with locals and prevent waste.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myListings.map(listing => (
            <FoodCard key={listing.id} listing={listing} showProviderControls />
          ))}
        </div>
      )}
    </Layout>
  );
}
