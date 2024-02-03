import { useState } from 'react';
import FlightListItem from './FlightListItem';
import {  Dropdown, Message, List } from 'semantic-ui-react';
import DismissableMessage from './DismissableMessage';
import Skeleton from 'react-loading-skeleton'
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
                    info.airport_info.departure.code.toLocaleLowerCase("tr-TR") === departureCode.toLocaleLowerCase("tr-TR")||
                    info.airport_info.departure.city.toLocaleLowerCase("tr-TR") === departureCode.toLocaleLowerCase("tr-TR")||
                    info.airport_info.departure.airport_name.toLocaleLowerCase("tr-TR") === departureCode.toLocaleLowerCase("tr-TR")
                );
            });
        }

        // this part filters flights with matching return date
        if (!oneDirection && data && data[returnDate]) {
            returnFlights = data[returnDate].filter((info) => {
                return (
                    info.airport_info.departure.code.toLocaleLowerCase("tr-TR")=== arrivalCode.toLocaleLowerCase("tr-TR") ||
                    info.airport_info.departure.city.toLocaleLowerCase("tr-TR") === arrivalCode.toLocaleLowerCase("tr-TR")||
                    info.airport_info.departure.airport_name.toLocaleLowerCase("tr-TR")=== arrivalCode.toLocaleLowerCase("tr-TR")
                );
            });
        }
    }

    // if it is not a oneDirection flight it finds best matches considering time
    const bestMatches = !oneDirection && departureFlights.map((departureFlight) => {
        const matchingReturnFlights = returnFlights.filter((returnFlight) => {
            const arrivalTimeDeparture = new Date(departureFlight.arrival_date).getTime();
            const departureTimeReturn = new Date(returnFlight.departure_date).getTime();
            return arrivalTimeDeparture < departureTimeReturn;
        });
            return [departureFlight, matchingReturnFlights[0]];
         
    }).filter((match) => match[1] !== undefined);

   if (!oneDirection && bestMatches.length === 0) {
    return (
        <DismissableMessage header="Uçuş Bulunamadı">
        Aradığınız Tarihlerde Uçuş Bulamadık
         </DismissableMessage>
    )
   } 

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
            {isLoading &&
                < Skeleton count={10} />
            }
            {
                error &&     
                <Message negative>
                    <Message.Header>Veritabanında bir hata oluştu!</Message.Header>
                    <p>Lütfen kısa bir süre sonra tekrar deneyin</p>
              </Message>
            
            }
            {
                   !error && !isLoading && data  &&  departureFlights.length == 0 &&
                   <DismissableMessage header="Uçuş Bulunamadı">
                       Aradığınız Tarihlerde Uçuş Bulamadık
                   </DismissableMessage>
            }
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
                            <div className="ticket_wrapper">
                                <div className="first_container">
                                    <FlightListItem  key={info.additional_info.flight_number}
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
                            <div className="ticket_wrapper">
                                <div className="first_container">
                                <FlightListItem  key={info[0].additional_info.flight_number + Math.random()}
                                    info={info[0]}                   
                                />
                                 <FlightListItem  key={info[1].additional_info.flight_number + Math.random()}
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