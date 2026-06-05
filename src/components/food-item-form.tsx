"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFoodItem } from "@/app/food/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  basePrice: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  expiryDate: z.coerce.date({
    required_error: "Expiry date is required.",
  }),
  pricingRule: z.enum(["linear_decay", "step_discount", "fixed"], {
    required_error: "Please select a pricing rule.",
  }),
  pickupWindow: z.string().min(3, "Example: '5 PM - 7 PM'"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export function FoodItemForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      expiryDate: new Date(Date.now() + 86400000), // Default 1 day
      pricingRule: "linear_decay",
      quantity: 1,
      pickupWindow: "5 PM - 7 PM",
      imageUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await createFoodItem({
        name: values.name,
        description: values.description,
        basePrice: values.basePrice,
        quantity: values.quantity,
        expiryDate: values.expiryDate,
        pricingRule: values.pricingRule,
        pickupWindow: values.pickupWindow,
        imageUrl: values.imageUrl || undefined,
      });

      toast({
        title: "Success",
        description: "Food item added successfully. Nutritional info has been generated.",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create food item. Make sure you are logged in.",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Sourdough Bread" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Briefly describe the food..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date & Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <FormField
          control={form.control}
          name="pricingRule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dynamic Pricing Rule</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pricing rule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fixed">Fixed (No discount)</SelectItem>
                  <SelectItem value="linear_decay">Linear Decay (Drops over 24h)</SelectItem>
                  <SelectItem value="step_discount">Step Discount (50% off &lt; 12h, 75% off &lt; 4h)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How the price should automatically reduce as it approaches expiry.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  How many portions are available?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pickupWindow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Window</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 5 PM - 7 PM" {...field} />
                </FormControl>
                <FormDescription>
                  When should the user come pick it up?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Provide a link to an image of the food item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Generating AI Nutrition & Saving..." : "Add Food Item"}
        </Button>
      </form>
    </Form>
  );
}
