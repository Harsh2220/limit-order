"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import DotPattern from "@/components/magicui/dot-pattern";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import useTokenStore from "@/store";
import getJupTokens from "@/utils/getJupTokens";
import { useEffect } from "react";

export default function Home() {
  const { setTokens, sellToken, buyToken } = useTokenStore();
  const { toast } = useToast();

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
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom,white,transparent,transparent)] "
        )}
      />
      <Card className="relative w-[380px] rounded-3xl shadow-none">
        <BorderBeam colorFrom="#1a1a1a" colorTo="#f5f5f5" />
        <CardHeader>
          <CardTitle className="text-2xl">Create your blink</CardTitle>
          <CardDescription>
            Deploy your blink and share on twitter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name" className="mb-1 text-sm">
                  You&apos;re Selling
                </Label>
                <SellTokenModal />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework" className="mb-1 text-sm">
                  You&apos;re Buying
                </Label>
                <BuyTokenModal />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            disabled={
              (!sellToken && !buyToken) ||
              sellToken?.address === buyToken?.address
            }
            className="w-full rounded-3xl h-11 text-md"
            onClick={() => {
              navigator.clipboard.writeText(
                `https://${window.location.hostname}/api/create?sell=${sellToken?.address}&buy=${buyToken?.address}`
              );
              toast({
                title: "Link copied",
              });
            }}
          >
            Copy Link
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
