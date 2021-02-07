import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import Filecomp from "./Filecomp";
import "./App.css";
import ipfs from "./ipfs";

class App extends Component {
  constructor(){
    super()
    this.state = {
      web3: null,
     accounts: null,
     contract: null,
     IPFSHash:null,
      buffer:'',
      fileHashes:[],
      verHash:null,
      verRes:''
      };

    this.convertToBuffer = this.convertToBuffer.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    //this.getFileHashes = this.getFileHashes.bind(this);
    this.verify = this.verify.bind(this)
    
  }

  componentDidMount = async () => {
    try {
      
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
        
      this.setState({ web3, accounts, contract: instance }, this.test);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
//verification function
verify = async() =>{
  const { accounts , contract } = this.state;
  await ipfs.add(this.state.buffer, (err, ipfsHash) => {
    console.log(err,ipfsHash);
  this.setState({ verHash:ipfsHash[0].hash });
  });
  const response = await contract.methods.verfiyHash(String(this.state.verHash)).call();
  console.log(response);

}
  

//getting all the hashses
  test = async () => {
    const { accounts , contract } = this.state;
    
    const noOfFile = await contract.methods.getNo().call();
    for(var i=noOfFile; i>=1;i--){
      console.log("working");
      const hash = await contract.methods.getHashFromId(i).call();
      this.setState({
        fileHashes:[...this.state.fileHashes,hash]
      })
    }
  }

//file upload function
 uploadFile = async() => {
  const { accounts, contract } = this.state;
    
  await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(err,ipfsHash);
    this.setState({ IPFSHash:ipfsHash[0].hash });
  });
 
 await contract.methods.uploadHash(String(this.state.IPFSHash)).send({ from: accounts[0] });
 }

 captureFile =(event) => {
  event.stopPropagation()
  event.preventDefault()
  const file = event.target.files[0]
  let reader = new window.FileReader()
  reader.readAsArrayBuffer(file)
  reader.onloadend = () => this.convertToBuffer(reader)    
};

  
  convertToBuffer = async(reader) => {
  //file is converted to a buffer for upload to IPFS
    const buffer = await Buffer.from(reader.result);
  //set this buffer -using es6 syntax
    this.setState({buffer});
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="nav">
          <h1>SecureDOC</h1>
          <p>Total Files stored:{this.state.fileHashes.length}</p>
        </div>
        

        <div className="main">
          <div className="up-div">
            <h3>Upload new file</h3>
            <input type="file" onChange = {this.captureFile} className="file-btn" name="filename"></input>
            <button className="upload-btn" onClick={this.uploadFile}>Upload</button>
            <button className="ver-btn" onClick={this.verify}>Verify</button>
          </div>
          <div>
            {this.state.verRes}
          </div>
          <div className="fileList">
            {this.state.fileHashes.map( (key , index) => <Filecomp id={index+1} hash = {key}/>)}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
