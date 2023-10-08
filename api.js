// Import necessary modules from AWS SDK for DynamoDB
const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

// Create a DynamoDB client for the specified AWS region
const db = new DynamoDBClient({ region: "ap-south-1" });

// Define regular expressions for validation
const nameRegex = /^[A-Za-z]{3,32}$/;
const CustomerNumberRegex = /^\d{11,12}$/;
const BankAccountNumber = /^\d{11,16}$/;

// Validation function for bankDetails object
const validation = (bankDetails) => {
  if (!nameRegex.test(bankDetails.BankName)) {
    return "BankName should be minimum 3 characters!";
  }
  if (!nameRegex.test(bankDetails.BranchName)) {
    return "BranchName should be minimum 3 characters!";
  }
  if (!nameRegex.test(bankDetails.BranchAddress)) {
    return "BranchAddress should be minimum 3 characters!";
  }
  if (!CustomerNumberRegex.test(bankDetails.CustomerNumber)) {
    return "CustomerNumber should be minimum 11 characters!";
  }
  if (!BankAccountNumber.test(bankDetails.BankAccountNumber)) {
    return "BankAccountNumber should be minimum 11 digits!";
  }
  //return null; // Validation passed
}

// Function to create an employee
const createEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    // Parse the JSON body from the event
    const body = JSON.parse(event.body);
    const bankDetails = body.bankDetails;
    console.log(bankDetails);
    
    // Perform validation on bankDetails
    const validationError = validation(bankDetails);
    if (validationError) {
      console.log("CustomerNumber:", bankDetails.CustomerNumber);
      throw new Error(validationError);
    }

    // Check for required fields in the body
    // if (!body.bankDetails.BankName || !body.bankDetails.BranchName || !body.bankDetails.BranchAddress || !body.bankDetails.BankAccountNumber) {
    //   throw new Error('Required fields are missing.');
    // }

    // Fetch an item from DynamoDB based on postId
    const employeeData = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: body.postId }),
    };
    const { Item } = await db.send(new GetItemCommand(employeeData));
    
    // Check if an item with the same postId exists in DynamoDB
    if (Item) {
      const item1 = { item2: Item ? unmarshall(Item) : {} };
      console.log(item1);

      // Check if bankDetails already exist in the fetched item
      if (item1.item2.bankDetails) {
        throw new Error("BankDetails already exists!");
      }
    }

    // Define parameters for inserting an item into DynamoDB
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        postId: body.postId,
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
      }, { removeUndefinedValues: true }),
    };

    // Insert the item into DynamoDB
    await db.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully created post.',
    });
  } catch (e) {
    console.error(e);
    response.body = JSON.stringify({
      message: 'Failed to create post.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

// Function to update an employee
const updateEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    // Parse the JSON body from the event
    const body = JSON.parse(event.body);
    const objKeys = Object.keys(body);
    
    // Perform validation on bankDetails
    const validationError = validation(body.bankDetails);
    if (validationError) {
      throw new Error(validationError);
    }

    // Define parameters for updating an item in DynamoDB
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.postId }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(', ')}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
    };

    // Update the item in DynamoDB
    const updateResult = await db.send(new UpdateItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully updated BankDetails.',
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.body = JSON.stringify({
      message: 'Failed to update BankDetails.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

// Export the createEmployee and updateEmployee functions
module.exports = {
  createEmployee,
  updateEmployee
};
