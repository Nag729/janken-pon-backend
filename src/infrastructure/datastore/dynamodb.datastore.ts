import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    UpdateCommand,
    QueryCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

type Sign = "between" | ">=" | ">" | "=" | "<=" | "<";
type QueryParams = {
    keyName: string;
    attributeValues: { sign: Sign; values: (string | number)[] };
};

export type QueryResult<T> = {
    Items: T[];
    Count: number;
    ScannedCount: number;
};

export class DynamoDBDataStore {
    private readonly _docClient: DynamoDBDocumentClient;
    private dynamoDbTableName = (tableName: string) => `${tableName}`;

    constructor() {
        if (process.env.DYNAMO_DB_URL === undefined) {
            throw new Error(`DYNAMO_DB_URL has not been set`);
        }

        const client = new DynamoDBClient({
            endpoint: process.env.DYNAMO_DB_URL,
            region: process.env.DYNAMO_DB_REGION,
            credentials: {
                accessKeyId: process.env.JANKEN_PON_DYNAMO_ACCESS_KEY_ID!,
                secretAccessKey: process.env.JANKEN_PON_DYNAMO_SECRET_ACCESS_KEY!,
            },
        });
        this._docClient = DynamoDBDocumentClient.from(client);
    }

    public async put(tableName: string, item: object, ttl?: number): Promise<void> {
        try {
            await this._docClient.send(
                new PutCommand({
                    TableName: this.dynamoDbTableName(tableName),
                    Item: { ...item, ttl },
                }),
            );
        } catch (err) {
            throw new Error(`Unable to add item. Error JSON: ${JSON.stringify(err, null, 2)}`);
        }
    }

    public async update(
        tableName: string,
        key: Record<string, any>,
        updateExpression: string,
        expressionAttributeValues: Record<string, any>,
    ): Promise<void> {
        try {
            await this._docClient.send(
                new UpdateCommand({
                    TableName: this.dynamoDbTableName(tableName),
                    Key: key,
                    UpdateExpression: updateExpression,
                    ExpressionAttributeValues: expressionAttributeValues,
                }),
            );
        } catch (err) {
            throw new Error(`Unable to update item. Error JSON: ${JSON.stringify(err, null, 2)}`);
        }
    }

    private createCondition = (params: QueryParams) => {
        switch (params.attributeValues.sign) {
            case "between":
                return `#${params.keyName} between :${params.keyName}0 and :${params.keyName}1`;
            default:
                return `#${params.keyName} ${params.attributeValues.sign} :${params.keyName}`;
        }
    };

    private createValue = (params: QueryParams) => {
        switch (params.attributeValues.sign) {
            case "between":
                return {
                    [`:${params.keyName}0`]: params.attributeValues.values[0],
                    [`:${params.keyName}1`]: params.attributeValues.values[1],
                };
            default:
                return {
                    [`:${params.keyName}`]: params.attributeValues.values[0],
                };
        }
    };

    public async query({
        tableName,
        partitioningKeyParams,
        sortKeyParams,
        limit,
    }: {
        tableName: string;
        partitioningKeyParams: QueryParams;
        sortKeyParams: QueryParams;
        limit?: number;
    }): Promise<any> {
        try {
            const result = await this._docClient.send(
                new QueryCommand({
                    TableName: this.dynamoDbTableName(tableName),
                    KeyConditionExpression: `${this.createCondition(partitioningKeyParams)} and ${this.createCondition(
                        sortKeyParams,
                    )}`,
                    ExpressionAttributeNames: {
                        [`#${partitioningKeyParams.keyName}`]: partitioningKeyParams.keyName,
                        [`#${sortKeyParams.keyName}`]: sortKeyParams.keyName,
                    },
                    ScanIndexForward: true, // 昇順
                    ExpressionAttributeValues: {
                        ...this.createValue(partitioningKeyParams),
                        ...this.createValue(sortKeyParams),
                    },
                    Limit: limit,
                }),
            );
            return result;
        } catch (err) {
            throw new Error(`Unable to query item. Error JSON: ${JSON.stringify(err, null, 2)}`);
        }
    }

    public async queryByPrimaryKey({
        tableName,
        partitioningKeyParams,
        limit,
    }: {
        tableName: string;
        partitioningKeyParams: QueryParams;
        limit?: number;
    }): Promise<any> {
        try {
            const result = await this._docClient.send(
                new QueryCommand({
                    TableName: this.dynamoDbTableName(tableName),
                    KeyConditionExpression: `${this.createCondition(partitioningKeyParams)}`,
                    ExpressionAttributeNames: {
                        [`#${partitioningKeyParams.keyName}`]: partitioningKeyParams.keyName,
                    },
                    ExpressionAttributeValues: {
                        ...this.createValue(partitioningKeyParams),
                    },
                    ScanIndexForward: true, // 昇順
                    Limit: limit,
                }),
            );
            return result;
        } catch (err) {
            throw new Error(`Unable to query item. Error JSON: ${JSON.stringify(err, null, 2)}`);
        }
    }

    public async delete({
        tableName,
        partitioningKey,
        sortKey,
    }: {
        tableName: string;
        partitioningKey: Record<string, any>;
        sortKey: Record<string, any>;
    }): Promise<any> {
        try {
            const result = await this._docClient.send(
                new DeleteCommand({
                    TableName: this.dynamoDbTableName(tableName),
                    Key: {
                        ...partitioningKey,
                        ...sortKey,
                    },
                }),
            );
            return result;
        } catch (err) {
            throw new Error(`Unable to delete item. Error JSON: ${JSON.stringify(err, null, 2)}`);
        }
    }
}
