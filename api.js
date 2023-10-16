// Import necessary modules from AWS SDK for DynamoDB
const {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

// Create a DynamoDB client for the specified AWS region
const db = new DynamoDBClient({ region: "ap-south-1" });

// Define regular expressions for validation
//validatins for name
const nameRegex = /^[A-Za-z]{3,32}$/;
//The customerNumber should be 11 digits only
const CustomerNumberRegex = /^\d{11}$/;
//BankAccountNumber should be minimum 11 and max 16 digits
const BankAccountNumber = /^\d{11,16}$/;

// Validation function for bankDetails object
const validation = (bankDetails) => {
  //bankname validation for minimum 3 characters
  if (!nameRegex.test(bankDetails.BankName)) {
    return "BankName should be minimum 3 characters!";
  }
  //branchName should be minimum 3 characters
  if (!nameRegex.test(bankDetails.BranchName)) {
    return "BranchName should be minimum 3 characters!";
  }
  //branchAddress should be minimum 3 characters
  if (!nameRegex.test(bankDetails.BranchAddress)) {
    return "BranchAddress should be minimum 3 characters!";
  }
  //customerNumber should be 11 characters
  if (!CustomerNumberRegex.test(bankDetails.CustomerNumber)) {
    return "CustomerNumber should be 11 characters!";
  }
  //bankDetails must be 11 digits
  if (!BankAccountNumber.test(bankDetails.BankAccountNumber)) {
    return "BankAccountNumber should be minimum 11 digits!";
  }
  return null; // Validation passed
};

// Function to create an employee
const BankDeatilsHandler = async (event) => {
  let response = { statusCode: 200 };
  const resource = event.resource;
  switch (resource) {
    case `/employee/bankDetails`:
      try {
        // Parse the JSON body from the event
        const body = JSON.parse(event.body);
        const bankDetails = body.bankDetails;
        console.log(bankDetails);

        // Perform validation on bankDetails
        const validationError = validation(bankDetails);
        if (validationError) {
          response.statusCode = 400;
          response.body = JSON.stringify({
            message: validationError,
          });
          throw new Error(validationError);
        }

        //Check for required fields in the body
        const requiredBankDetails = [
          "BankName",
          "BranchName",
          "BranchAddress",
          "CustomerNumber",
          "BankAccountNumber",
          "IsSalaryAccount",
          "IsActive",
          "IsDeleted",
        ];
        //Iterate bankDetails to check mandatory fields
        for (const field of requiredBankDetails) {
          if (!body.bankDetails[field]) {
            response.statusCode = 400;
            throw new Error(`${field} is a mandatory field!`);
          }
        }
        //empId should be given mandatory
        if (!body.empId) {
          response.statusCode = 400;
          throw new Error("empId is a mandatory field!");
        }

        // Define parameters for inserting an item into DynamoDB
        const params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          //add the below line in params to validate post method to restrict duplicate posts
          ConditionExpression: "attribute_not_exists(empId)",
          Item: marshall({
            empId: body.empId,
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

        // Insert the item into DynamoDB
        await db.send(new PutItemCommand(params));
        response.body = JSON.stringify({
          message: "Successfully created BankDetails!",
        });
      } catch (e) {
        // To through the exception if anything failing while creating bankDetails
        console.error(e);
        if (e.name === "ConditionalCheckFailedException") {
          response.statusCode = 400;
          response.body = JSON.stringify({
            message: "BankDetails Already Exists!",
            errorMsg: e.message,
          });
        } else {
          console.error(e);
          response.body = JSON.stringify({
            message: "Failed to update BankDetails.",
            errorMsg: e.message,
            errorStack: e.stack,
          });
        }
      }
      break;

    // Function to update an employee
    case `/employee/bankDetails/{empId}`:
      try {
        // Parse the JSON body from the event
        const body = JSON.parse(event.body);
        const objKeys = Object.keys(body);

        // Perform validation on bankDetails
        const validationError = validation(body.bankDetails);
        if (validationError) {
          response.statusCode = 400;
          response.body = JSON.stringify({
            message: validationError,
          });
          throw new Error(validationError);
        }

        // Define parameters for updating an item in DynamoDB
        const params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ empId: event.pathParameters.empId }),
          //add the below line in params to validate and restrict the put method (updates only if the attribute exists)
          ConditionExpression: "attribute_exists(empId)",
          UpdateExpression: `SET ${objKeys
            .map((_, index) => `#key${index} = :value${index}`)
            .join(", ")}`,
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
          message: "Successfully updated BankDetails.",
          updateResult,
        });
      } catch (e) {
        console.error(e);
        if (e.name === "ConditionalCheckFailedException") {
          response.statusCode = 400;
          response.body = JSON.stringify({
            message: "BankDetails not found!",
            errorMsg: e.message,
          });
        } else {
          console.error(e);
          response.body = JSON.stringify({
            message: "Failed to update BankDetails!",
            errorMsg: e.message,
            errorStack: e.stack,
          });
        }
      }
      break;
      case `/employee/salary/{empId}`:
    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ empId: event.pathParameters.empId }),
      };
      const { Item } = await db.send(new GetItemCommand(empData));
    const item1 = { item2: Item ? unmarshall(Item) : {} };


    // Check if Salary  Info exists
    const isSalaryExisting = item1.item2.salaryDetails;
    if (!isSalaryExisting) {  //remove above line code
      throw new Error("Salary Details already exists");
    }
      const deleteBankDetails = await db.send(new DeleteItemCommand(params));
      response.body = JSON.stringify({
        message: 'Successfully deleted BankDetails!',
        deleteBankDetails,
      });
    } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Failed to delete Salary!',
        errorMsg: e.message,
        errorStack: e.stack,
      });
    }
    break;
  }
      
  return response;
};


// Export the createEmployee and updateEmployee functions
module.exports = {
  BankDeatilsHandler,
};
