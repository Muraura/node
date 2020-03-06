module.exports = function calculateThreatLevel(threat_level, score_name, tolerance_name, value = null, issue_type) {

    if (issue_type === 'Pests' || issue_type === 'Diseases') {
        switch (tolerance_name) {
            case "Score 1":
            case "Score 2":
                threat_level = (threat_level === 'Danger' || threat_level === 'Warning') ? threat_level : "Success";
                break;
            case "Score 3":
            case "Score 4":
                threat_level = (threat_level === 'Danger') ? threat_level : "Warning";
                break;
            case "Score 5":
                threat_level = "Danger";
                break;
            default:
                threat_level = (threat_level === 'Danger' || threat_level === 'Warning') ? threat_level : "Success";
        }
    } else {
        switch (issue_type) {
            case "Others":
                if (value === 1) {
                    threat_level = (threat_level === 'Danger') ? threat_level : "Warning";
                }
                break;
            case "Beneficials":
                threat_level = (threat_level === 'Danger' || threat_level === 'Warning') ? threat_level : "Success";
                break;
            default:
                threat_level = (threat_level === 'Danger' || threat_level === 'Warning') ? threat_level : "Success";
        }
    }

    return threat_level;
}