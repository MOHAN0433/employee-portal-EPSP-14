const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const db = new DynamoDBClient({ region: "ap-south-1" });

const createEmployee = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const bankDetails = body.bankDetails;

    // Check if bankDetails is defined
    if (!bankDetails) {
      throw new Error("bankDetails is missing in the request body");
    }

    const empData = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: body.postId }),
    };
    const { Item } = await db.send(new GetItemCommand(empData));
    const item1 = { item2: Item ? unmarshall(Item) : {} };

    // Initialize bankDetails as an array if it's not present
    if (!item1.item2.bankDetails) {
      item1.item2.bankDetails = [];
    }

    // Check if bankDetails.BankAccountNumber already exists
    const isBankAccountExisting = item1.item2.bankDetails.some((existingBank) => existingBank.BankAccountNumber === bankDetails.BankAccountNumber);
    if (isBankAccountExisting) {
      throw new Error("BankAccountNumber already exists");
    }

    // Push bankDetails into the array
    item1.item2.bankDetails.push(bankDetails);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        postId: body.postId,
        bankDetails: item1.item2.bankDetails, // Store the updated array
      }, { removeUndefinedValues: true }),
    };

    await db.send(new PutItemCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Successfully created post.',
      }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to create post.',
        errorMsg: e.message,
        errorStack: e.stack,
      }),
    };
  }
};

module.exports = {
  createEmployee
};
