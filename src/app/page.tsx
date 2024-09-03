"use client";

import BuyTokenModal from "@/components/modals/BuyTokenModal";
import SellTokenModal from "@/components/modals/SellTokenModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import useTokenStore from "@/store";
import getJupTokens from "@/utils/getJupTokens";
import { useEffect } from "react";

export default function Home() {
  const { setTokens, sellToken, buyToken } = useTokenStore();

  async function storeTokens() {
    try {
      const data = await getJupTokens();
      setTokens(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    storeTokens();
  });

  return (
    <main className="min-h-screen w-full flex justify-center items-center">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Create your blink</CardTitle>
          <CardDescription>
            Deploy your blink and share on twitter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name" className="mb-1 text-xs">
                  You&apos;re Selling
                </Label>
                <SellTokenModal />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework" className="mb-1 text-xs">
                  You&apos;re Buying
                </Label>
                <BuyTokenModal />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            disabled={!sellToken && !buyToken}
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(
                `http://localhost:3000/api/create?sellTokenAddress=${sellToken?.address}&buyTokenAddress=${buyToken?.address}`
              );
            }}
          >
            Copy Blink
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
