import { CallBuilder } from "./call_builder";
import { HttpClient } from "../http-client";
export declare class FriendbotBuilder extends CallBuilder<any> {
    constructor(serverUrl: URI, httpClient: HttpClient, address: string);
}
