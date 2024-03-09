//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public lender;
    address public inspector;
    address public nftAddress;
    address payable public seller;


    modifier OnlySeller(){
        require(msg.sender == seller , "Only Seller can call this method");
        _;
    }

    modifier onlyBuyer(uint256 _nftID){
        require(msg.sender == buyer[_nftID] , "Only Buyer can call this method");
        _;
    }

    modifier onlyInspector(){
        require(msg.sender == inspector , "Only Inspector can call this method");
        _;
    }

    mapping(uint256  => bool)public isListed;
    mapping(uint256  => uint256)public purchasePrice;
    mapping(uint256  => uint256)public escrowAmount;
    mapping(uint256  => address)public buyer;
    mapping(uint256  => bool)public inspectionStatus;
    mapping(uint256  => mapping(address => bool) )public approval;


    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        lender = _lender;
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
    }



    function list(uint256 _nftId , uint256 _purchasePrice , address _buyer ,uint256 _escrowAmount ) public payable OnlySeller{
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);

        isListed[_nftId] = true;
        purchasePrice[_nftId] =_purchasePrice;
        buyer[_nftId] = _buyer;
        escrowAmount[_nftId] = _escrowAmount;
    }

    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID){
        require(msg.value >= escrowAmount[_nftID]);

    }
     function updateInspectionStatus(uint256 _nftId , bool _passed) public onlyInspector{
        
        inspectionStatus[_nftId] = _passed;

    }

    function approveSale(uint256 _nftId) public {
        approval[_nftId][msg.sender]  = true;
    }


    receive() external payable {}


    function getBalance()public view returns(uint256){
        return address(this).balance;
    }


function finalizeSale(uint _nftId) public {
    require(inspectionStatus[_nftId]);
    require(approval[_nftId][buyer[_nftId]]);
    require(approval[_nftId][seller]);
    require(approval[_nftId][lender]);
   require(address(this).balance >= purchasePrice[_nftId]);

    isListed[_nftId] = false;

   (bool success,) = payable(seller).call{value:address(this).balance}("");
   require(success);


        IERC721(nftAddress).transferFrom(address(this), buyer[_nftId], _nftId);


}


function cancelSale(uint _nftId)public{
    if(inspectionStatus[_nftId]==false){
        payable(buyer[_nftId]).transfer(address(this).balance);
    }else{
        payable(seller).transfer(address(this).balance);
        
    }
}

   
}
