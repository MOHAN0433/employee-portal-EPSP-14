const { expect } = require('chai');
const { createEmployee, updateEmployee } = require('./api');
const {
  DynamoDBClient,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// Mock DynamoDBClient to avoid making actual AWS calls
const mockClient = {
  send: () => ({}),
};

// Mock employee data for createEmployee
const createEmployeeData = {
    postId: "25",
    bankDetails: {
      BankName: "kanara",
      BranchName: "hydrabad",
      BranchAddress: "bangalore",
      CustomerNumber: "12345678912",
      BankAccountNumber: "55566444412",
      IsSalaryAccount: "yes",
      IsActive: "yes",
      IsDeleted: "false"
    }
  };

// Mock employee data for updateEmployee
const updateEmployeeData = {
    BankName: "kanara",
    BranchName: "hydrabad",
    BranchAddress: "bangalore",
    CustomerNumber: "12345678912",
    BankAccountNumber: "55566444412",
    IsSalaryAccount: "yes",
    IsActive: "yes",
    IsDeleted: "flase"
};

// Successfully create an employee
// Successfully create an employee
describe('createEmployee unit tests', () => {
    let originalDynamoDBClient;
  
    before(() => {
      originalDynamoDBClient = DynamoDBClient;
      DynamoDBClient.prototype.send = () => mockClient.send();
    });
  
    after(() => {
      DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
    });
  
    it('successfully create an employee', async () => {
      // Mock event object with employee data
      let event = {
        body: JSON.stringify(createEmployeeData),
      };
    
      const response = await createEmployee(event);
      expect(response.statusCode).to.equal(200);
      const responseBody = JSON.parse(response.body);
      expect(responseBody.message).to.equal('Successfully created post.');
    });
    
    it('fails to create an employee with missing data', async () => {
      // Mock event object with missing data
      let event = {
        body: JSON.stringify({}), // Missing required data
      };
    
      const response = await createEmployee(event);
      expect(response.statusCode).to.equal(400); // Expecting a 400 Bad Request for missing data
    });
    
    it('fails to create an employee with invalid data', async () => {
      // Mock event object with invalid data
      let event = {
        body: JSON.stringify({
          // Invalid data that should fail validation
          BankName: 'AB', // Too short
        }),
      };
    
      const response = await createEmployee(event);
      expect(response.statusCode).to.equal(400); // Expecting a 400 Bad Request for invalid data
    });
    
  
  // Successfully update an employee
  describe('updateEmployee unit tests', () => {
    let originalDynamoDBClient;
  
    before(() => {
      originalDynamoDBClient = DynamoDBClient;
      DynamoDBClient.prototype.send = () => mockClient.send();
    });
  
    after(() => {
      DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
    });
  
    it('successfully update an employee', async () => {
      // Mock event object with the employee ID and updated data
      let event = {
        pathParameters: {
          postId: '25', // Assuming this postId exists
        },
        body: JSON.stringify(updateEmployeeData),
      };
    
      const response = await updateEmployee(event);
      expect(response.statusCode).to.equal(200);
      const responseBody = JSON.parse(response.body);
      expect(responseBody.message).to.equal('Successfully updated BankDetails.'); // Update the message if necessary
    });
    
    it('fails to update an employee with invalid data', async () => {
      // Mock event object with invalid data
      let event = {
        pathParameters: {
          postId: '25', // Assuming this postId exists
        },
        body: JSON.stringify({
          // Invalid data that should fail validation
          BankName: 'a', // Too short
        }),
      };
    
      const response = await updateEmployee(event);
      expect(response.statusCode).to.equal(400); // Expecting a 400 Bad Request for invalid data
    });
    
  });
  