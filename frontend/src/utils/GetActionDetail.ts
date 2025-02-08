import { EntityBase } from "../models/EntityBase";

export function GetActionDetail<T extends EntityBase>(Data: T, DataType: "create" | "update"): T {
    try {
        switch (DataType) {
            case "create":
                Data.created_at = new Date();
                break;
        }
        return Data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}