module.exports = function calculateParentThreatLevel(parent_threat_level,
    alert) {

    switch (alert) {
        case "Default":
            parent_threat_level = (parent_threat_level === 'Danger' || parent_threat_level === 'Warning' || parent_threat_level === 'Success') ? parent_threat_level : "Default";
            break;

        case "Success":
            parent_threat_level = (parent_threat_level === 'Danger' || parent_threat_level === 'Warning') ? parent_threat_level : "Success";
            break;

        case "Warning":
            parent_threat_level = (parent_threat_level === 'Danger') ? parent_threat_level : "Warning";
            break;

        case "Danger":
            parent_threat_level = "Danger";
            break;

        default:
            parent_threat_level = (parent_threat_level === 'Danger' || parent_threat_level === 'Warning' || parent_threat_level === 'Success') ? parent_threat_level : "Default";
    }
    return parent_threat_level;

}