import  { useState, useRef, useEffect } from "react";
import  { useGetFlightsQuery } from './store';
import { skipToken } from "@reduxjs/toolkit/query/react";
import DatePicker , { registerLocale } from "react-datepicker";
import { Checkbox , Message } from 'semantic-ui-react';
import { AutoComplete } from 'primereact/autocomplete';
import FlightList from './components/FlightList';
import AmadeusLogo from "./images/logo.png";
import Skeleton from 'react-loading-skeleton'
import tr from "date-fns/locale/tr"; 
import { codes } from './components/airportCodes';
import 'semantic-ui-css/semantic.min.css'
import "react-datepicker/dist/react-datepicker.css";
import 'react-loading-skeleton/dist/skeleton.css'
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "./css/index.css";
import { classNames } from "primereact/utils";

registerLocale("tr", tr);

export default function App() {
    const [departureCode, setDepartureCode] = useState(""); 
    const [arrivalCode, setArrivalCode] = useState(""); 
    const [departureDate, setDepartureDate] = useState(new Date().toDateString());
    const [returnDate, setReturnDate] = useState(new Date().toDateString());
    const [oneDirection, setOneDirection] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const { data, isLoading, error } = useGetFlightsQuery((departureCode && arrivalCode && {departureDate, returnDate}) || skipToken);
    

    const departureCodeRef = useRef();
	const arrivalCodeRef = useRef();
    const departureDateRef = useRef();
    const returnDateRef = useRef();

    // If departureDate or arrivalCode is defined check for validity on DatePickers.
    // This is because one of the requirements was automatic search if departureCode and 
    // arrivalCode is defined
    useEffect(() => {
        if (departureCode && arrivalCode) {
            const fakeEvent = {
                preventDefault: () => {} ,
                stopPropagation: () => {}
            };
            handleClick(fakeEvent);
        }
    }, [departureCode, arrivalCode])

    useEffect(() =>  {
        if (oneDirection) document.querySelector(".react-datepicker__input-container").classList.add("ui",  "icon",  "input");
        else if (!oneDirection) {
            const datepickerContainers = document.querySelectorAll(".react-datepicker__input-container");

            datepickerContainers.forEach(container => {
                container.classList.add("ui", "icon", "input");
            });
        
        }

}, [oneDirection]);

// Validate user input and show warning if it's not correct
    const handleClick = (event) => {
        event.preventDefault();
		event.stopPropagation();
        let valid = true;
        


        if (!departureCodeRef.current || !arrivalCodeRef.current || !departureDateRef.current || (!oneDirection && !returnDateRef.current) ) {
            return;
        } 
        const departureCodeInput = departureCodeRef.current;
        const arrivalCodeInput = arrivalCodeRef.current;
       const departureInput = departureDateRef.current.input;
       const returnInput = !oneDirection ? returnDateRef.current.input: null;


        departureCodeInput.setCustomValidity("");
        arrivalCodeInput.setCustomValidity("");
        departureInput.setCustomValidity("");

        if (departureCode.length === 0) {
            departureCodeInput.setCustomValidity("Kalkış yapacağınız havaalanını yazınız.")
            departureCodeInput.reportValidity();
            valid = false;
        } if (arrivalCode.length === 0) {
            arrivalCodeInput.setCustomValidity("İniş yapacağınız havaalanını yazınız.")
            arrivalCodeInput.reportValidity();
            valid = false;
        } if (departureDate === null) {
            departureInput.setCustomValidity("Kalkış yapacağınız tarihi seçiniz");
            departureInput.reportValidity();
            valid = false;
        } if (!oneDirection && returnDate === null) {
            returnInput.setCustomValidity("");
            returnInput.setCustomValidity("Dönüş yapacağınız tarihi seçiniz");
            returnInput.reportValidity();
            valid = false;
        }
    }
    
    const currentSuggestions = [];
    const suggestionList = {};

    // Add suggestions to show for user input &&  do not display same suggestions

    const search = ( input) => {
        codes.map((code) => {
            if (code.airportName.toLocaleLowerCase("tr-TR").includes(input.toLocaleLowerCase("tr-TR"))) {
                if (!suggestionList[code.airportName]) {
                    currentSuggestions.push(code.airportName);
                    suggestionList[code.airportName] = true;
                }
            }  if (code.city.toLocaleLowerCase("tr-TR").includes(input.toLocaleLowerCase("tr-TR"))) {
                if (!suggestionList[code.city]) {
                    currentSuggestions.push(code.city);
                    suggestionList[code.city] = true;
                }
            }  if (code.code.toLocaleLowerCase("tr-TR").includes(input.toLocaleLowerCase("tr-TR"))) {
                if (!suggestionList[code.code]) {
                    currentSuggestions.push(code.code);
                    suggestionList[code.code] = true;
                }
            }
        });
        setSuggestions(currentSuggestions);
    }
    return (
        <div id="container">
             <div id="flight_search">  
                <img src={AmadeusLogo} alt="Logo" />;
                <h1 style={{color: "white", margin: "auto", width: "50%", marginBottom:"3%"}}>
                    Türkiye'deki en ucuz uçuşları tek tıklamayla bulun.
                </h1>
                <div id="flight_input">
                    <div className="ui icon input" id="from_div">
                        <AutoComplete suggestions={suggestions.slice(0, 10)} completeMethod={() => search(departureCode)} id="from" inputRef={departureCodeRef}
                        value={departureCode}  onInput={(e) => {setDepartureCode(e.target.value); e.target.setCustomValidity("");}} 
                            className="ui icon input" placeholder="Kalkış: istanbul" onChange={(e) => setDepartureCode(e.target.value)}/>
                        
                    </div>
                    <div className="ui icon input" id="to_div">
                        <AutoComplete suggestions={suggestions.slice(0, 10)} completeMethod={() => search(arrivalCode)} id="to" inputRef={arrivalCodeRef}
                            value={arrivalCode}  onInput={(e) => {setArrivalCode(e.target.value); e.target.setCustomValidity("");
                        }} className="ui icon input" placeholder="Varış: antalya" onChange={(e) => setArrivalCode(e.target.value)} />
                     
                    </div>
                    <DatePicker locale={tr}  dateFormat="dd/MM/yyyy" ref={departureDateRef}
                        selected={departureDate ? new Date(departureDate): null} onChange={(date) => {date ? setDepartureDate(date.toDateString()): setDepartureDate(null)}} />
                        {oneDirection ? null : 
                    <DatePicker locale={tr}   dateFormat="dd/MM/yyyy"  ref={returnDateRef}
                        className="return_date_picker"
                         selected={returnDate ? new Date(returnDate): null} onChange={(date) => date ? setReturnDate(date.toDateString()) : setReturnDate(null) } />
                    }
                    <button onClick={handleClick} className="ui primary button">Arayın</button><br />         
                </div>
                <div>
                    <Checkbox label="Tek yön" id="one_way" checked={oneDirection} 
                        onChange={(e , data) => setOneDirection(data.checked)}
                    />  
                </div>
            </div>
            {
                error && error.data &&  <Message negative>
                <Message.Header>Veritabanında bir hata oluştu!</Message.Header>
                <p>Lütfen kısa bir süre sonra tekrar deneyin</p>
                </Message>
            }
             {
                isLoading == true &&  <Skeleton count={10} />
             }
            {
               data && <FlightList    data={data}  oneDirection={oneDirection} departureDate={departureDate} 
                arrivalCode={arrivalCode} returnDate={returnDate} departureCode={departureCode}/>
            } 
            {
                (!data && !error && !isLoading)  &&
                <div id="home_img_container"  style={{ backgroundImage:`url(images/beach.jpg)` }}>
                    <div id="beach_div">
                        <span className="beach_span">Tatile çıkmanın tam sırası!</span>
                        <p className="beach_p">Yazın son anlarının tadını çıkarın</p>
                    </div>
                </div> 
            }
        </div>
       
    );
}

