const { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const db = new DynamoDBClient({ region: "ap-south-1" });

const createEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const bankDetails= body.bankDetails
    // Check for required fields
    // if (!body.bankDetails.BankName || !body.bankDetails.BranchName || !body.bankDetails.BranchAddress || !body.bankDetails.BankAccountNumber) {
    //   throw new Error('Required fields are missing.');
    // }

    //const id = body.postId;
    // const empData = {
    //     TableName: process.env.DYNAMODB_TABLE_NAME,
    //     Key: marshall({ postId: body.postId }),
    //   };
    //   const { Item } = await db.send(new GetItemCommand(empData));

    //   if(Item) {
    //     throw new Error("already exists")
    //   }
      

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        postId: body.postId,
    bankDetails : {
        BankName: bankDetails.BankName,//give bank object and validate it and set it bankname
        BranchName: bankDetails.BranchName,
        BranchAddress: bankDetails.BranchAddress,
        CustomerNumber: bankDetails.CustomerNumber,
        BankAccountNumber: bankDetails.BankAccountNumber,
        IsSalaryAccount: bankDetails.IsSalaryAccount, //required boolean
        IsActive: bankDetails.IsActive, //required boolean
        IsDeleted: bankDetails.IsDeleted, //required boolean
      }}, { removeUndefinedValues: true }),  //for remove undefined fields
    };

    if (await isBankAccountNumberExists(bankDetails.BankAccountNumber)) {
      throw new Error('BankAccountNumber already exists.');
    }

    await db.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully created post.',
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to create post.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

// Function to check if a bankAccountNumber already exists in the database
async function isBankAccountNumberExists(bankAccountNumber) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "bankDetails.BankAccountNumber = :accountNumber",
    ExpressionAttributeValues: {
      ":accountNumber": bankAccountNumber,
    },
  };

  const { Count } = await db.send(new QueryCommand(params));
  return Count > 0;
}

module.exports = {
  createEmployee
};