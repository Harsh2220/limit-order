import createOrder from "@/utils/createOrder";
import getTokenInfo from "@/utils/getTokenInfo";
import getTokenPrice from "@/utils/getTokenPrice";
import {
    ACTIONS_CORS_HEADERS,
    ActionGetResponse,
    ActionPostRequest,
    ActionPostResponse
} from "@solana/actions";
import {
    PublicKey
} from "@solana/web3.js";

export const GET = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);
        const sellTokenAddress = requestUrl.searchParams.get("sellTokenAddress")
        const buyTokenAddress = requestUrl.searchParams.get("buyTokenAddress")

        console.log(sellTokenAddress, buyTokenAddress)

        if (!sellTokenAddress || !buyTokenAddress) {
            return Response.json("Data not provided", {
                headers: ACTIONS_CORS_HEADERS,
            });
        }

        const [sellTokenInfo, buyTokenInfo] = await Promise.all([getTokenInfo(sellTokenAddress), getTokenInfo(buyTokenAddress)])

        const payload: ActionGetResponse = {
            title: `Sell ${sellTokenInfo.result.symbol} & Buy ${buyTokenInfo.result.symbol}`,
            icon: "https://cryptonary.com/cdn-cgi/image/width=2048/https://cryptonary.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/CryptoSchool0516_Limit-Orders_Jup.jpg",
            description: `Create limit orders with just single click`,
            label: "Create Limit Order",
            links: {
                actions: [
                    {
                        label: "Create Limit Order",
                        href: `${requestUrl.href}&amount={amount}&rate={rate}`,
                        parameters: [
                            {
                                name: "amount",
                                label: "Enter the amount",
                                required: true,
                            },
                            {
                                name: "rate",
                                label: "Enter the rate",
                                required: true,
                            },
                        ],
                    },
                ],
            },
        };

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });
    } catch (err) {
        console.log(err);
        let message = "An unknown error occurred";
        if (typeof err == "string") message = err;
        return new Response(message, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);

        const body: ActionPostRequest = await req.json();

        const sellTokenAddress = requestUrl.searchParams.get("sellTokenAddress")
        const buyTokenAddress = requestUrl.searchParams.get("buyTokenAddress")
        const amount = requestUrl.searchParams.get("amount")
        const rate = requestUrl.searchParams.get("rate")

        let account: PublicKey;

        try {
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response('Invalid "account" provided', {
                status: 400,
                headers: ACTIONS_CORS_HEADERS,
            });
        }

        if (!sellTokenAddress || !buyTokenAddress || !amount || !rate) {
            return Response.json("Data not provided", {
                headers: ACTIONS_CORS_HEADERS,
            });
        }

        const [buyTokenPrice, sellTokenInfo] = await Promise.all([getTokenPrice(buyTokenAddress), getTokenInfo(sellTokenAddress)])

        const inAmount = parseInt(amount) * Math.pow(10, parseInt(sellTokenInfo.result.decimals))
        const ss = buyTokenPrice / Number(rate);
        const outAmount = (inAmount * ss) / buyTokenPrice;

        const data = await createOrder({
            inAmount: inAmount,
            outAmount: outAmount,
            inputMint: sellTokenAddress,
            outputMint: buyTokenAddress,
            owner: account.toString(),
        })

        console.log(data)

        const payload: ActionPostResponse = {
            transaction: data?.tx,
            message: `Limit order created`,
        };

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });
    } catch (err) {
        let message = "An unknown error occurred";
        if (typeof err == "string") message = err;
        return new Response(message, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }
};