const express = require('express');
const router = express.Router();
const {dynamoTableName, partitionKey, awsRegion} = require("../app-constants.js");

const {DynamoDBClient, PutItemCommand, GetItemCommand} = require("@aws-sdk/client-dynamodb");
const dynamodbClient = new DynamoDBClient({region: awsRegion});

// Store key-value pair
router.post('/store', async (req, res) => {
    console.log(req.body);

    const {key, value} = req.body;
    const params = {
        TableName: dynamoTableName,
        Item: {[partitionKey]: {S: key}, value: {S: value}}
    };
    let command = new PutItemCommand(params);

    try {
        await dynamodbClient.send(command);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Retrieve value by key
router.get('/retrieve/:key', async (req, res) => {

    const params = {
        TableName: dynamoTableName,
        Key: {[partitionKey]: {S: req.params.key}}
    };

    console.log(params);

    try {
        let command = new GetItemCommand(params);
        console.log(command);
        const { Item } = await dynamodbClient.send(command);
                if (Item) {
            res.json({ value: Item.value.S });  // Assume 'S' since you are using String type in DynamoDB
        } else {
            res.status(404).send('Key not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
