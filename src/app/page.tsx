import Chart from "@/components/Chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>TradingView Lightweight Chart Example</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart />
        </CardContent>
      </Card>
    </div>
  );
}
