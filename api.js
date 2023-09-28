const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const db = new DynamoDBClient({ region: "ap-south-1" });

const createEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const postId = body.postId; // Get postId from the body

    // Check for required fields and validate bank details
    const { bankDetails } = body;
    if (!bankDetails || !bankDetails.BankName || !bankDetails.BranchName || !bankDetails.BranchAddress || !bankDetails.BankAccountNumber || typeof bankDetails.IsSalaryAccount !== 'boolean' || typeof bankDetails.IsActive !== 'boolean' || typeof bankDetails.IsDeleted !== 'boolean') {
      throw new Error('Invalid or missing fields in bankDetails.');
    }

    // Check if the employee already exists
    const empData = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId }),
    };
    const { Item } = await db.send(new GetItemCommand(empData));
    if (Item) {
      throw new Error("Employee with postId already exists.");
    }

    // Create and save the employee record
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        postId,
        bankDetails: {
          BankName: bankDetails.BankName,
          BranchName: bankDetails.BranchName,
          BranchAddress: bankDetails.BranchAddress,
          CustomerNumber: bankDetails.CustomerNumber,
          BankAccountNumber: bankDetails.BankAccountNumber,
          IsSalaryAccount: bankDetails.IsSalaryAccount,
          IsActive: bankDetails.IsActive,
          IsDeleted: bankDetails.IsDeleted,
        },
      }),
    };

    await db.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully created employee record.',
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to create employee record.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

module.exports = {
  createEmployee
};
