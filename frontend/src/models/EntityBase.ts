export interface EntityBase {
    created_at: Date;
    updated_at: Date;
    
//   modifiedDate: Date;

//   createdBy: string;
//   modifiedBy: string;

//   rowVersion: string;
}
export function GetActionDetail(Data: any, DataType: string) {
    try {
      switch (DataType) {
        case "create":
          Data.createdDate = new Date().toISOString();
          Data.modifiedDate = new Date().toISOString();
          break;
        case "update":
          Data.modifiedDate = new Date().toISOString();
          break;
      }
  
      return Data;
    } catch (error) {
      console.log(error);
    }
  }
