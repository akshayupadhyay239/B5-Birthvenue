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
     ipfsHash:'',
      buffer:'',
      fileHashes:[],
      verRes:''
      };

    this.convertToBuffer = this.convertToBuffer.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.getFileHashes = this.getFileHashes.bind(this);
    
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
        
      this.setState({ web3, accounts, contract: instance }, this.getFileHashes);
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  getFileHashes = async () => {
    const { accounts, contract } = this.state;

    const response = await contract.methods.getHashes().call();
    //const response = await contract.methods.get().call();
    console.log(response)
    // Update state with the result.
    this.setState({ fileHashes:response });
  };

  uploadFile = async() => {
  const { accounts, contract } = this.state;

  await ipfs.add(this.state.buffer, (err, ipfsHash) => {
    console.log(err,ipfsHash);
    //setState by setting ipfsHash to ipfsHash[0].hash 
    this.setState({ ipfsHash:ipfsHash[0].hash });
  });
 
  await contract.methods.uploadHash(this.state.ipfsHash).send({ from: accounts[0] });

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
          <p>{this.state.ipfsHash} {this.state.fileHashes.length}</p>
        </div>
        

        <div className="main">
          <div className="up-div">
            <h3>Upload new file</h3>
            <input type="file" onChange = {this.captureFile} className="file-btn" name="filename"></input>
            <button className="upload-btn" onClick={this.uploadFile}>Upload</button>
            <button className="ver-btn" >Verify</button>
          </div>
          
          <div>
            
          </div>
          <div className="fileList">
            {this.state.fileHashes}
            <Filecomp id="1" filename="firstfile" hash = {this.state.fileHashes[0]}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
