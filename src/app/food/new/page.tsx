import { FoodItemForm } from "@/components/food-item-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewFoodItemPage() {
  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Add New Food Item</CardTitle>
          <CardDescription>
            List surplus food, set pricing rules, and our AI will automatically estimate the nutritional value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FoodItemForm />
        </CardContent>
      </Card>
    </div>
  );
}
