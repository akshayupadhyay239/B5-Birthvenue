pragma solidity 0.5.16;
pragma experimental ABIEncoderV2;

contract SimpleStorage {
   //owner of this contract (institution or enterprise)
    address owner;
    uint n = 0;
    //array of all DocHashes of account
    mapping(uint => string) DocHashes;

    constructor() public{
        owner = msg.sender;
    }

  event HashStored(
    uint noOfNotes,
    string DocHash,
    address add
  );

  event Failed(
      string HashToStored,
      address add
      );


  function verfiyHash(string memory _hash) public view returns(string memory result){
        if(msg.sender==owner){
            for(uint i = 1;i<=n;i++){
                string memory temp = DocHashes[i];
                if(keccak256(abi.encodePacked(temp)) == keccak256(abi.encodePacked(_hash))){
                    result = "Authentic Document";
                    return result;
                }
            }
            result = "Not Authentic";
            return result;
        }
        result = "You are Not allowed";
        return result;
    }

    function getNo() public view returns(uint no){
      no = n;
    }

      function getHashFromId(uint id) public view returns(string memory Hash){
        Hash = DocHashes[id];
    }

   /* function getHashes() public view returns(string[] memory){
        string[] memory allHashes = new string[](n);
        for(uint i = 1;i<=n;i++){
            allHashes[i-1] = DocHashes[i];
        }
        return allHashes;
    }*/

  function uploadHash(string memory _hash) public {
      if(msg.sender==owner){
        n++;
        DocHashes[n] = _hash;
        emit HashStored(n, _hash, msg.sender);
      }
     else{
         emit Failed(_hash,msg.sender);
     }
  }
  
}
