import { List } from 'semantic-ui-react'
import { IoIosAirplane } from "react-icons/io";
import { MdAirlineSeatReclineExtra } from "react-icons/md";
import THYLogo from './images/thy.png';
import PegasusLogo from './images/pegasus.png';
import SunExpressLogo from './images/sunexpress.png';
import AjLogo from './images/aj_logo.png';


export default function FlightListItem({ info }) {
    const departureDate = info.departure_date.split("T")[1].slice(0, 5);
    const arrivalDate = info.arrival_date.split("T")[1].slice(0, 5);
    let logo;

    if (info.company === "Turkish Airlines") logo = THYLogo;
    else if (info.company === "Pegasus Airlines") logo = PegasusLogo;
    else if (info.company === "SunExpress" ) logo  = SunExpressLogo;
    else if (info.company === "AnadoluJet") logo = AjLogo

    return (
        <List.Item className="ticket">
            <List.Content>
                <List.Header>
                <img src={logo} style={{marginRight:"2%", marginLeft: "2%", marginTop: "2%"}} />
                <span className="ticket_time">
                   {departureDate}
                   <span className="departure_info">     
                            {info.airport_info.departure.airport_name}
                            ({info.airport_info.departure.code})
                    </span> 
                </span>
                <span className="flight_duration_container">
                    <span className="flight_number">Uçuş Numarası:{info.additional_info.flight_number}</span><br />
                    {info.additional_info.flight_duration}
                    <div className="flight_line">
                     </div>
                    <IoIosAirplane color="gray" />
                     </span>
                    <span className="ticket_time">
                         {arrivalDate}
                    <span className="arrival_info">{info.airport_info.departure.airport_name}({info.airport_info.departure.code})</span>
                </span>
                </List.Header>
                <div>
                    Boş <MdAirlineSeatReclineExtra /> {info.additional_info.available_seats}
                </div>
            </List.Content>
        </List.Item>
    );
}