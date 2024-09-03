import { TokenInfoResponse } from "@/types/tokenInfo"

export default async function getTokenInfo(address: string): Promise<TokenInfoResponse> {
    const response = await fetch(`https://api.shyft.to/sol/v1/token/get_info?network=mainnet-beta&token_address=${address}`, {
        method: "GET",
        headers: {
            "x-api-key": process.env.SHYFT_API!
        }
    })
    const data = await response.json()
    return data
}
