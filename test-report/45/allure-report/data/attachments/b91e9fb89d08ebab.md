# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e5]:
      - img "Bank Logo" [ref=e6]
      - heading "NoBugs Bank" [level=1] [ref=e7]
    - generic [ref=e9] [cursor=pointer]:
      - generic [ref=e10]: Noname
      - generic [ref=e11]: "@g96xZVB"
    - button "🚪 Logout" [ref=e12] [cursor=pointer]
  - generic [ref=e13]:
    - heading "🔄 Make a Transfer" [level=1] [ref=e14]
    - generic [ref=e15]:
      - button "🆕 New Transfer" [ref=e16] [cursor=pointer]
      - button "🔁 Transfer Again" [active] [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - generic [ref=e19]: "Search by Username or Name:"
      - textbox "Enter name to find transactions" [ref=e20]
      - button "🔍 Search Transactions" [ref=e21] [cursor=pointer]
      - heading "Matching Transactions" [level=3] [ref=e22]
      - list
  - button "🏠 Home" [ref=e23] [cursor=pointer]
```