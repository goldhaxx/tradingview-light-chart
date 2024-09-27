import { createClient as createServerClient } from '@/utils/supabase/server'
import Chart from '@/components/Chart'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PriceDataPage() {
  const supabase = createServerClient()

  const { data: priceData } = await supabase.from('price_data').select()

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Price Data</CardTitle>
        </CardHeader>
        <CardContent>
          {priceData && priceData.length > 0 ? (
            <>
              <pre className="mb-4 max-h-40 overflow-auto">{JSON.stringify(priceData, null, 2)}</pre>
              <Chart />
            </>
          ) : (
            <Chart />
          )}
        </CardContent>
      </Card>
    </div>
  )
}