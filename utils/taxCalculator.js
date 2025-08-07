 export function calculateMonthlyIncomeTaxFromGross(grossMonthlyIncome) {
      const taxBrackets = [
        { min: 0, max: 158000, rate: 0.15, fixedTax: 0 },
        { min: 158000, max: 330000, rate: 0.20, fixedTax: 23700 },
        { min: 330000, max: 1200000, rate: 0.27, fixedTax: 58100 },
        { min: 1200000, max: 4300000, rate: 0.35, fixedTax: 293000 },
        { min: 4300000, max: Infinity, rate: 0.40, fixedTax: 1378000 }
      ];

      if (grossMonthlyIncome <= 0) return 0;

      // 1️⃣ KDV'siz net matrahı hesapla (KDV oranı %20 → 100/120)
      const monthlyNetIncome = grossMonthlyIncome * (100 / 120);

      // 2️⃣ Yıllık matrahı hesapla
      const annualIncome = monthlyNetIncome * 12;

      // 3️⃣ Gelir vergisini yıllık hesapla
      let totalAnnualTax = 0;
      for (let i = 0; i < taxBrackets.length; i++) {
        const bracket = taxBrackets[i];
        if (annualIncome > bracket.min && annualIncome <= bracket.max) {
          const taxable = annualIncome - bracket.min;
          totalAnnualTax = bracket.fixedTax + (taxable * bracket.rate);
          break;
        }
      }

      // 4️⃣ Aylık vergi
      const monthlyTax = totalAnnualTax / 12;
      return Math.round(monthlyTax * 100) / 100;
    }