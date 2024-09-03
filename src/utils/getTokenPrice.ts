export default async function getTokenPrice(address: string) {
    const res = await fetch(
        `https://public-api.birdeye.so/defi/price?address=${address}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": process.env.BIRDEYE_API_KEY as string,
            },
        }
    );
    const data = await res.json();
    return data.data.value;
}