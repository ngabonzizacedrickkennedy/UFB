package com.ufb.auth.user_management.validation;

import java.util.Hashtable;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import org.springframework.stereotype.Component;

/**
 * Checks whether an email's domain can plausibly receive mail, via DNS
 * MX/A/AAAA lookups. This confirms the domain is real and mail-capable —
 * it cannot confirm a specific mailbox exists (major providers block that
 * kind of probing), so it's a best-effort filter against typo'd or
 * made-up domains, not a guarantee the exact address is live.
 */
@Component
public class EmailDomainValidator {

    public boolean domainAcceptsMail(String email) {
        if (email == null) return false;
        int at = email.lastIndexOf('@');
        if (at < 0 || at == email.length() - 1) return false;

        String domain = email.substring(at + 1);
        return hasDnsRecord(domain, "MX") || hasDnsRecord(domain, "A") || hasDnsRecord(domain, "AAAA");
    }

    private boolean hasDnsRecord(String domain, String type) {
        Hashtable<String, String> env = new Hashtable<>();
        env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
        env.put("java.naming.provider.url", "dns:");
        env.put("com.sun.jndi.dns.timeout.initial", "2000");
        env.put("com.sun.jndi.dns.timeout.retries", "1");
        try {
            InitialDirContext ctx = new InitialDirContext(env);
            Attributes attrs = ctx.getAttributes(domain, new String[]{type});
            Attribute attr = attrs.get(type);
            return attr != null && attr.size() > 0;
        } catch (NamingException e) {
            return false;
        }
    }
}
