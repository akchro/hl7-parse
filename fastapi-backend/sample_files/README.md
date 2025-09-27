# Sample HL7 Files

This directory contains realistic HL7 v2.5 sample files for testing the HL7 LiteBoard system.

## Files Available

### 1. adt_admission.hl7
**Message Type**: ADT^A01 (Admission)
**Description**: Patient admission to ICU with allergies and basic demographics
**Contains**:
- Patient demographics (PID segment)
- Visit information (PV1 segment)
- Allergies (AL1 segments)
- Vital signs (OBX segments)
- Diagnosis (DG1 segment)

### 2. oru_lab_results.hl7
**Message Type**: ORU^R01 (Observation Results)
**Description**: Laboratory results including CBC and Basic Metabolic Panel
**Contains**:
- Complete Blood Count results
- Basic Metabolic Panel results
- Normal values with reference ranges
- Multiple OBX segments for different lab values

### 3. orm_medication_order.hl7
**Message Type**: ORM^O01 (Order Message)
**Description**: Medication orders including cardiac medications
**Contains**:
- Multiple medication orders (RXO segments)
- Route information (RXR segments)
- Special instructions (NTE segments)
- Order control (ORC segments)

### 4. adt_discharge.hl7
**Message Type**: ADT^A03 (Discharge)
**Description**: Patient discharge with diagnoses and procedures
**Contains**:
- Discharge information
- Final diagnoses (DG1 segments)
- Procedures performed (PR1 segment)
- Discharge instructions (NTE segments)

## Usage

These files can be uploaded through the FastAPI endpoints or used with the sample processing endpoints to test the HL7 to XML/JSON/PDF conversion functionality.

## HL7 Structure Notes

All messages follow HL7 v2.5 standard with:
- MSH (Message Header) segment
- Appropriate trigger events
- Realistic patient data (fictional)
- Proper segment ordering
- Valid field separators and encoding characters