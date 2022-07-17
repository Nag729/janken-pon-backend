import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

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
    private readonly _docClient: DocumentClient;
    private dynamoDbTableName = (tableName: string) => `${tableName}`;

    constructor() {
        if (process.env.DYNAMO_DB_URL === undefined) {
            throw new Error(`DYNAMO_DB_URL has not been set`);
        }

        const config = {
            endpoint: process.env.DYNAMO_DB_URL,
            region: process.env.DYNAMO_DB_REGION,
            accessKeyId: process.env.DYNAMO_ACCESS_KEY_ID,
            secretAccessKey: process.env.DYNAMO_SECRET_ACCESS_KEY,
        };
        this._docClient = new AWS.DynamoDB.DocumentClient(config);
    }

    public async put(tableName: string, item: object, ttl?: number): Promise<void> {
        const params: DocumentClient.PutItemInput = {
            TableName: this.dynamoDbTableName(tableName),
            Item: { ...item, ttl },
        };
        return new Promise((resolve, reject) => {
            this._docClient.put(params, (err) => {
                if (err) {
                    return reject(new Error(`Unable to add item. Error JSON: ${JSON.stringify(err, null, 2)}`));
                }
                return resolve();
            });
        });
    }

    public async update(
        tableName: string,
        key: DocumentClient.Key,
        updateExpression: DocumentClient.UpdateExpression,
        expressionAttributeValues: DocumentClient.ExpressionAttributeValueMap,
    ): Promise<void> {
        const params: DocumentClient.UpdateItemInput = {
            TableName: this.dynamoDbTableName(tableName),
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
        };
        return new Promise((resolve, reject) => {
            this._docClient.update(params, (err) => {
                if (err) {
                    return reject(new Error(`Unable to update item. Error JSON: ${JSON.stringify(err, null, 2)}`));
                }
                return resolve();
            });
        });
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
        const queryParams: DocumentClient.QueryInput = {
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
        };

        return new Promise((resolve, reject) => {
            this._docClient.query(queryParams, (err, data) => {
                if (err) {
                    return reject(new Error(`Unable to query item. Error JSON: ${JSON.stringify(err, null, 2)}`));
                }
                return resolve(data);
            });
        });
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
        const queryParams: DocumentClient.QueryInput = {
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
        };

        return new Promise((resolve, reject) => {
            this._docClient.query(queryParams, (err, data) => {
                if (err) {
                    return reject(new Error(`Unable to query item. Error JSON: ${JSON.stringify(err, null, 2)}`));
                }
                return resolve(data);
            });
        });
    }

    public async delete({
        tableName,
        partitioningKey,
        sortKey,
    }: {
        tableName: string;
        partitioningKey: DocumentClient.Key;
        sortKey: DocumentClient.Key;
    }): Promise<DocumentClient.DeleteItemOutput> {
        const deleteParams: DocumentClient.Delete = {
            TableName: this.dynamoDbTableName(tableName),
            Key: {
                ...partitioningKey,
                ...sortKey,
            },
        };

        return new Promise((resolve, reject) => {
            this._docClient.delete(deleteParams, (err, data) => {
                if (err) {
                    return reject(new Error(`Unable to delete item. Error JSON: ${JSON.stringify(err, null, 2)}`));
                }
                return resolve(data);
            });
        });
    }
}
