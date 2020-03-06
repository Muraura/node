module.exports = function calculateVarietyThreatLevel(parent_threat_level, scoutIssueType) {
    // console.log(parent_threat_level)

    // console.log(scoutIssueType)
    //console.log(scoutAlert)

    if (scoutIssueType === 'Pests' || scoutIssueType === 'Diseases' || scoutIssueType === 'Others' || scoutIssueType === 'Beneficials') {
        switch (scoutIssueType) {
            case "Danger":
                parent_threat_level = "Danger";
                break;
            case "Success":
                parent_threat_level = "Success";
                break;
            default:
                parent_threat_level = "Danger";

        }

    }
    console.log(parent_threat_level)
    return parent_threat_level;

}