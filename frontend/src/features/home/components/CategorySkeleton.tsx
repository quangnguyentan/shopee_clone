import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export const CategorySkeleton = () => {
  return (
    <Card className="border-none shadow-none !p-0">
      <CardContent className="flex flex-col items-center justify-center h-40 gap-3 border border-gray-100">
        <Skeleton className="w-20 h-20 rounded-full bg-gray-100" />
        <Skeleton className="h-3 w-full bg-gray-100" />
      </CardContent>
    </Card>
  );
};
