use crate::schema::{
    ConditionOp, ConditionType, ConditionValue, FirewallAction, FirewallDecision, FirewallRequest,
    FirewallRule,
};
use regex::Regex;
use std::collections::HashMap;

pub fn evaluate_firewall(rules: &[FirewallRule], request: &FirewallRequest) -> FirewallDecision {
    let normalized_headers: HashMap<String, String> = request
        .headers
        .as_ref()
        .map(|headers| {
            headers
                .iter()
                .map(|(k, v)| (k.to_ascii_lowercase(), v.clone()))
                .collect()
        })
        .unwrap_or_default();

    for rule in rules {
        if rule.enabled == Some(false) {
            continue;
        }

        let all_conditions_match = rule.conditions.iter().all(|cond| {
            let actual = match cond.condition_type {
                ConditionType::Ip => request.ip.as_deref(),
                ConditionType::Path => Some(request.path.as_str()),
                ConditionType::Method => Some(request.method.as_str()),
                ConditionType::Country => request.country.as_deref(),
                ConditionType::UserAgent => request.user_agent.as_deref(),
                ConditionType::Header => cond
                    .key
                    .as_ref()
                    .and_then(|k| normalized_headers.get(&k.to_ascii_lowercase()).map(String::as_str)),
            };

            let Some(actual_str) = actual else {
                return false;
            };

            match_op(actual_str, cond.op, &cond.value)
        });

        if all_conditions_match {
            return FirewallDecision {
                action: rule.action,
                rule_id: Some(rule.id.clone()),
            };
        }
    }

    FirewallDecision {
        action: FirewallAction::Allow,
        rule_id: None,
    }
}

fn match_op(actual: &str, op: ConditionOp, value: &ConditionValue) -> bool {
    let values = value.as_slice();
    match op {
        ConditionOp::Eq => values.first().is_some_and(|v| actual == v),
        ConditionOp::Neq => values.first().is_some_and(|v| actual != v),
        ConditionOp::Contains => values.iter().any(|v| actual.contains(v.as_str())),
        ConditionOp::StartsWith => values.iter().any(|v| actual.starts_with(v.as_str())),
        ConditionOp::Regex => values
            .iter()
            .any(|pattern| Regex::new(pattern).is_ok_and(|re| re.is_match(actual))),
        ConditionOp::In => values.iter().any(|v| v == actual),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema::FirewallCondition;

    fn sample_request() -> FirewallRequest {
        FirewallRequest {
            ip: Some("1.2.3.4".to_string()),
            path: "/admin/settings".to_string(),
            method: "POST".to_string(),
            country: Some("US".to_string()),
            user_agent: Some("Mozilla/5.0".to_string()),
            headers: Some(
                [("X-Custom-Auth".to_string(), "secret-val".to_string())]
                    .into_iter()
                    .collect(),
            ),
        }
    }

    #[test]
    fn defaults_to_allow_when_empty_rules() {
        let req = sample_request();
        let decision = evaluate_firewall(&[], &req);
        assert_eq!(decision.action, FirewallAction::Allow);
        assert_eq!(decision.rule_id, None);
    }

    #[test]
    fn denies_blocked_ip() {
        let req = sample_request();
        let rule = FirewallRule {
            id: "block-ip".to_string(),
            action: FirewallAction::Deny,
            conditions: vec![FirewallCondition {
                condition_type: ConditionType::Ip,
                op: ConditionOp::Eq,
                value: ConditionValue::Single("1.2.3.4".to_string()),
                key: None,
            }],
            enabled: Some(true),
            description: None,
        };

        let decision = evaluate_firewall(&[rule], &req);
        assert_eq!(decision.action, FirewallAction::Deny);
        assert_eq!(decision.rule_id.as_deref(), Some("block-ip"));
    }

    #[test]
    fn skips_disabled_rule() {
        let req = sample_request();
        let rule = FirewallRule {
            id: "disabled-block".to_string(),
            action: FirewallAction::Deny,
            conditions: vec![FirewallCondition {
                condition_type: ConditionType::Ip,
                op: ConditionOp::Eq,
                value: ConditionValue::Single("1.2.3.4".to_string()),
                key: None,
            }],
            enabled: Some(false),
            description: None,
        };

        let decision = evaluate_firewall(&[rule], &req);
        assert_eq!(decision.action, FirewallAction::Allow);
        assert_eq!(decision.rule_id, None);
    }

    #[test]
    fn matches_headers_case_insensitively() {
        let req = sample_request();
        let rule = FirewallRule {
            id: "header-check".to_string(),
            action: FirewallAction::Challenge,
            conditions: vec![FirewallCondition {
                condition_type: ConditionType::Header,
                op: ConditionOp::Eq,
                value: ConditionValue::Single("secret-val".to_string()),
                key: Some("x-custom-auth".to_string()),
            }],
            enabled: Some(true),
            description: None,
        };

        let decision = evaluate_firewall(&[rule], &req);
        assert_eq!(decision.action, FirewallAction::Challenge);
        assert_eq!(decision.rule_id.as_deref(), Some("header-check"));
    }

    #[test]
    fn evaluates_and_conditions_correctly() {
        let req = sample_request();
        let rule = FirewallRule {
            id: "post-admin-rate-limit".to_string(),
            action: FirewallAction::RateLimit,
            conditions: vec![
                FirewallCondition {
                    condition_type: ConditionType::Path,
                    op: ConditionOp::StartsWith,
                    value: ConditionValue::Single("/admin".to_string()),
                    key: None,
                },
                FirewallCondition {
                    condition_type: ConditionType::Method,
                    op: ConditionOp::Eq,
                    value: ConditionValue::Single("POST".to_string()),
                    key: None,
                },
            ],
            enabled: Some(true),
            description: None,
        };

        let decision = evaluate_firewall(&[rule], &req);
        assert_eq!(decision.action, FirewallAction::RateLimit);
        assert_eq!(decision.rule_id.as_deref(), Some("post-admin-rate-limit"));
    }
}
