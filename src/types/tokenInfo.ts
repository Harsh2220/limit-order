export interface TokenInfoResponse {
    success: string
    message: string
    result: Result
}

export interface Result {
    name: string
    symbol: string
    metadata_uri: string
    description: string
    image: string
    decimals: string
    address: string
    mint_authority: string
    freeze_authority: string
    current_supply: string
    extensions: any[]
}
