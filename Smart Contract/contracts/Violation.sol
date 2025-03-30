// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Privio {
    address public admin; // Contract deployer (backend)

    struct Violation {
        uint256 id;
        string location;
        string reporter;
        string report;
        string pinataLink;
        bool exists;
    }

    mapping(uint256 => Violation) private violations;
    uint256 public violationCount = 0;

    event ViolationUploaded(uint256 id, string location, string reporter, address indexed sender);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Access denied: Only admin can view reports");
        _;
    }

    constructor() {
        admin = msg.sender; // Set backend as admin
    }

    // 🔹 Allow anyone to upload a violation
    function uploadViolation(
        uint256 _id, 
        string memory _location, 
        string memory _reporter, 
        string memory _report, 
        string memory _pinataLink
    ) public {
        require(!violations[_id].exists, "Violation ID already exists");

        violations[_id] = Violation(_id, _location, _reporter, _report, _pinataLink, true);
        violationCount++;

        emit ViolationUploaded(_id, _location, _reporter, msg.sender);
    }

    // 🔹 Only Admin can view reports
    function getViolation(uint256 _id) public view onlyAdmin returns (Violation memory) {
        require(violations[_id].exists, "Violation not found");
        return violations[_id];
    }
}
