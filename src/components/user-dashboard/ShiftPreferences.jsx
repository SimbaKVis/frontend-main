import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Styled-components for styling
const Container = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: auto;
  background-color:rgb(255, 255, 255); 
`;

const Title = styled.h1`
  text-align: center;
  color: :rgb(11, 10, 10); 
`;

const Subtitle = styled.h2`
  margin-top: 20px;
  color: :rgb(11, 10, 10); 
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color::rgb(11, 10, 10); 
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 10px;
  background-color:rgb(23, 31, 41);
  color: :rgb(249, 249, 249);
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color:rgb(41, 69, 96);
  }
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  background-color:rgb(11, 10, 10);
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const ShiftPreferences = ({ employeeName }) => {
  const [preferredStartTime, setPreferredStartTime] = useState('');
  const [preferredEndTime, setPreferredEndTime] = useState('');
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [recurringDates, setRecurringDates] = useState([null, null]);

  const handleAddUnavailableTime = () => {
    setUnavailableTimes([
      ...unavailableTimes,
      { startTime: preferredStartTime, endTime: preferredEndTime }
    ]);
    setPreferredStartTime('');
    setPreferredEndTime('');
  };

  const handleDateChange = (dates) => {
    setRecurringDates(dates);
  };

  return (
    <Container>
      <Title>Shift Preferences</Title>
      <Subtitle>Set Preferred Working Hours</Subtitle>
      <FormGroup>
        <Label>
          Preferred Start Time:
          <Input
            type="time"
            value={preferredStartTime}
            onChange={(e) => setPreferredStartTime(e.target.value)}
          />
        </Label>
        <Label>
          Preferred End Time:
          <Input
            type="time"
            value={preferredEndTime}
            onChange={(e) => setPreferredEndTime(e.target.value)}
          />
        </Label>
        <Button onClick={handleAddUnavailableTime}>
          Add Unavailable Time
        </Button>
      </FormGroup>
      <Subtitle>Set Recurring Preferences</Subtitle>
      <FormGroup>
        <Label>Recurring Dates:</Label>
        <DatePicker
          selected={recurringDates[0]}
          onChange={handleDateChange}
          startDate={recurringDates[0]}
          endDate={recurringDates[1]}
          selectsRange
          inline
        />
      </FormGroup>
      <Subtitle>Unavailable Times</Subtitle>
      <List>
        {unavailableTimes.map((time, index) => (
          <ListItem key={index}>
            {`Unavailable from ${time.startTime} to ${time.endTime}`}
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ShiftPreferences;
