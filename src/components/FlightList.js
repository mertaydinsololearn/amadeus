import { useState } from 'react';
import FlightListItem from './FlightListItem';
import {  Dropdown, Message, List } from 'semantic-ui-react';
import DismissableMessage from './DismissableMessage';
import './css/FlightList.css';


export default function FlightList({ data, isLoading, error, oneDirection, departureDate, departureCode, returnDate, arrivalCode }) {
    const [selected, setSelected] = useState("");
    const options = ["Kalkış Saati", "Uçuş Uzunluğu", "Fiyat"];
    if (!oneDirection) options.push("Dönüş Saati");


    let departureFlights = [];
    let returnFlights = [];
    

    // This part filters flights with matching departureDate
    if (data && Object.keys(data).length !== 0) {
        if (data[departureDate]) {
            departureFlights = data[departureDate].filter((info) => {
                return (
                    (info.airport_info.departure.code.toLocaleLowerCase("tr-TR") === departureCode.toLocaleLowerCase("tr-TR")||
                    info.airport_info.departure.city.toLocaleLowerCase("tr-TR") === departureCode.toLocaleLowerCase("tr-TR")||
                    info.airport_info.departure.airport_name.toLocaleLowerCase("tr-TR") === departureCode.toLocaleLowerCase("tr-TR"))
                    && 
                    (info.airport_info.arrival.code.toLocaleLowerCase("tr-TR") === arrivalCode.toLocaleLowerCase("tr-TR")||
                    info.airport_info.arrival.city.toLocaleLowerCase("tr-TR") === arrivalCode.toLocaleLowerCase("tr-TR")||
                    info.airport_info.arrival.airport_name.toLocaleLowerCase("tr-TR") === arrivalCode.toLocaleLowerCase("tr-TR"))
                );
            });
        }

        // this part filters flights with matching return date
        if (!oneDirection && data && data[returnDate]) {
            returnFlights = data[returnDate].filter((info) => {
                return (
                    (info.airport_info.departure.code.toLocaleLowerCase("tr-TR")=== arrivalCode.toLocaleLowerCase("tr-TR") ||
                    info.airport_info.departure.city.toLocaleLowerCase("tr-TR") === arrivalCode.toLocaleLowerCase("tr-TR")||
                    info.airport_info.departure.airport_name.toLocaleLowerCase("tr-TR")=== arrivalCode.toLocaleLowerCase("tr-TR"))
                    &&
                    (
                        (info.airport_info.arrival.code.toLocaleLowerCase("tr-TR")=== departureCode.toLocaleLowerCase("tr-TR") ||
                        info.airport_info.arrival.city.toLocaleLowerCase("tr-TR") === departureCode.toLocaleLowerCase("tr-TR")||
                        info.airport_info.arrival.airport_name.toLocaleLowerCase("tr-TR")=== departureCode.toLocaleLowerCase("tr-TR"))
                    )
                );
            });
        }
    }

    // if it is not a oneDirection flight it finds best matches considering time
    var bestMatches =  [];
    if (!oneDirection) {
         departureFlights.map((departureFlight) => {
           const matchingReturnFlights = returnFlights.filter((returnFlight) => {
               const arrivalTimeDeparture = new Date(departureFlight.arrival_date).getTime();
               const departureTimeReturn = new Date(returnFlight.departure_date).getTime();
               return arrivalTimeDeparture < departureTimeReturn;
           });
   
           for (let i = 0; i < matchingReturnFlights.length; i++) {
               bestMatches.push([departureFlight, matchingReturnFlights[i]]);
           }
            
       });
      bestMatches = bestMatches.filter((match) => match[1] !== undefined);
      
    }

    // Check if one direction or two direction flight is found && if not found display a user friendly message && check for error
    
    if (!isLoading &&  oneDirection && data  &&  departureFlights.length == 0 ) {
        return (
            <DismissableMessage header="Uçuş Bulunamadı">
            Aradığınız Tarihlerde Uçuş Bulunamadı
            </DismissableMessage>
        );   
    } else if (!oneDirection && bestMatches.length === 0) {
        return (
            <DismissableMessage header="Uçuş Bulunamadı">
                Aradığınız Tarihlerde Uçuş Bulunamadı
            </DismissableMessage>
            );
   }  


   // Sort the flights whether one direction is selected or not

    if (selected === "Fiyat") {
        if (oneDirection) {
            departureFlights.sort((a , b) => {
                return a.price - b.price;
            })
        } else {
            bestMatches.sort((a , b) => {
               return (a[0].price + a[1].price) - (b[0].price + b[1].price);
            })
        }
    } else if (selected === "Kalkış Saati") {
        if (oneDirection) {
            departureFlights.sort((a , b) => {
                return new Date(a.departure_date) - new Date(b.departure_date);
            })
        } else {
            bestMatches.sort((a , b) => {
                return new Date(a[0].departure_date) - new Date(b[0].departure_date);
            })
        }
    } else if (selected === "Dönüş Saati") {
        bestMatches.sort((a , b) => {
            return new Date(a[1].departure_date) - new Date(b[1].departure_date);
        })
    }  else if (selected === "Uçuş Uzunluğu") {
        if (oneDirection) {
            departureFlights.sort((a , b) => {
                return parseInt(a.additional_info.flight_duration) - parseInt(b.additional_info.flight_duration);
            })
        } else {
            bestMatches.sort((a , b) => {
                return (
                    (parseInt(a[0].additional_info.flight_duration) + parseInt(a[1].additional_info.flight_duration)) - 
                    (parseInt(b[0].additional_info.flight_duration) + parseInt(b[1].additional_info.flight_duration))
                );
            })
        }
    }

    return (
        <div id="flight_results">
                {
                     departureFlights && departureFlights.length &&
                    <Dropdown
                        icon='filter'
                        floating
                        labeled
                        button
                        className='icon dropdown'
                        text={selected || "Filtrele"}
                     >   
                    <Dropdown.Menu>
                       {options.map((option) => {
                            return <Dropdown.Item key={option} onClick={() => setSelected(option)}>{option}</Dropdown.Item>
                       })}
                    </Dropdown.Menu>
                </Dropdown>
                
                }
               <List divided verticalAlign="middle">
                {
                     departureFlights && departureFlights.length > 0 && oneDirection &&
                        departureFlights.map((info) => {
                        return (
                            <div className="ticket_wrapper" key={info.additional_info.flight_number}>
                                <div className="first_container">
                                    <FlightListItem  
                                    info={info}                  
                                    />
                                </div>
                                <div className="additional_info">
                                    {info.price}₺
                                </div>
                               
                            </div>
                        ) 
                    })
                }
                {
                      departureFlights && departureFlights.length && !oneDirection &&
                      bestMatches.map((info) => {
                          return (
                            <div className="ticket_wrapper"  key={info[0].additional_info.flight_number + info[1].additional_info.flight_number + Math.random()} >
                                <div className="first_container">
                                <FlightListItem
                                    info={info[0]}                   
                                />
                                 <FlightListItem  
                                    info={info[1]}                   
                                    />
                                </div>
                                <div className="additional_info">
                                    {info[0].price + info[1].price}₺
                                </div>
                            </div>
                          )
                      })
                }
                
                </List>
        </div>
      
    )
}