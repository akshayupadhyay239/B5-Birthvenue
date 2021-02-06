import React from "react";

function Filecomp(props){
    return <div className="file-comp">
        <p className="name">{props.id}. {props.filename}</p>
        <button className="down-btn">download</button>
    </div>
}

export default Filecomp;
