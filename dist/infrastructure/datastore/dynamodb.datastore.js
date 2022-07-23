"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBDataStore = void 0;
const AWS = __importStar(require("aws-sdk"));
class DynamoDBDataStore {
    constructor() {
        this.dynamoDbTableName = (tableName) => `${tableName}`;
        this.createCondition = (params) => {
            switch (params.attributeValues.sign) {
                case "between":
                    return `#${params.keyName} between :${params.keyName}0 and :${params.keyName}1`;
                default:
                    return `#${params.keyName} ${params.attributeValues.sign} :${params.keyName}`;
            }
        };
        this.createValue = (params) => {
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
    async put(tableName, item, ttl) {
        const params = {
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
    async update(tableName, key, updateExpression, expressionAttributeValues) {
        const params = {
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
    async query({ tableName, partitioningKeyParams, sortKeyParams, limit, }) {
        const queryParams = {
            TableName: this.dynamoDbTableName(tableName),
            KeyConditionExpression: `${this.createCondition(partitioningKeyParams)} and ${this.createCondition(sortKeyParams)}`,
            ExpressionAttributeNames: {
                [`#${partitioningKeyParams.keyName}`]: partitioningKeyParams.keyName,
                [`#${sortKeyParams.keyName}`]: sortKeyParams.keyName,
            },
            ScanIndexForward: true,
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
    async queryByPrimaryKey({ tableName, partitioningKeyParams, limit, }) {
        const queryParams = {
            TableName: this.dynamoDbTableName(tableName),
            KeyConditionExpression: `${this.createCondition(partitioningKeyParams)}`,
            ExpressionAttributeNames: {
                [`#${partitioningKeyParams.keyName}`]: partitioningKeyParams.keyName,
            },
            ExpressionAttributeValues: {
                ...this.createValue(partitioningKeyParams),
            },
            ScanIndexForward: true,
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
    async delete({ tableName, partitioningKey, sortKey, }) {
        const deleteParams = {
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
exports.DynamoDBDataStore = DynamoDBDataStore;
//# sourceMappingURL=dynamodb.datastore.js.map