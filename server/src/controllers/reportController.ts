import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import * as dbUtil from './../utils/dbUtil';

interface Report {
    year: number;
    caregivers: {
        name: string;
        patients: string[];
        caregiver_id: number;
        patient_id: number;
    }[];
}

export const getReport = async (req: Request, res: Response) => {
    const sql = `
        SELECT
            caregiver.id      AS caregiver_id,
            caregiver.name    AS caregiver_name,
            patient.id        AS patient_id,
            patient.name      AS patient_name,
            visit.date        AS visit_date
        FROM caregiver
        JOIN visit ON visit.caregiver = caregiver.id
        JOIN patient ON patient.id = visit.patient
    `;

    let result: QueryResult;
    try {
        result = await dbUtil.sqlToDB(sql, []);
        const report: Report = {
            year: parseInt(req.params.year),
            caregivers: [],
        };
        for (let row of result.rows) {
            if (row.visit_date.getFullYear() == req.params.year) {
                report.caregivers.push({
                    name: row.caregiver_name,
                    patients: [row.patient_name],
                    caregiver_id: row.caregiver_id as number,
                    patient_id: row.patient_id as number,
                });
            }
        }
        res.status(200).json(report);
    } catch (error) {
        throw new Error(error.message);
    }
};
