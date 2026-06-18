const fs = require('fs');
const files = [
  { path: 'src/app/api/category/route.js', 
    oldStr: 'INSERT INTO restaurant_categories (name, slug, image, image_id) VALUES ($1, $2, $3, $4) RETURNING *',
    newStr: 'INSERT INTO restaurant_categories (tenant_id, name, slug, image, image_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    oldParams: '[name, slug, cloudImage.secure_url, cloudImage.public_id]',
    newParams: '[tenant_id, name, slug, cloudImage.secure_url, cloudImage.public_id]'
  },
  { path: 'src/app/api/user/management/route.js',
    oldStr: 'INSERT INTO restaurant_users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
    newStr: 'INSERT INTO restaurant_users (tenant_id, name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, role',
    oldParams: '[name, email, hashedPass, userPhone, role]',
    newParams: '[tenant_id, name, email, hashedPass, userPhone, role]'
  },
  { path: 'src/app/api/user/route.js',
    oldStr: 'INSERT INTO restaurant_users (name, email, password, phone, is_verified, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, phone, role',
    newStr: 'INSERT INTO restaurant_users (tenant_id, name, email, password, phone, is_verified, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, phone, role',
    oldParams: '[name, email, hashedPass, phone, false, verificationToken, verificationExpires]',
    newParams: '[tenant_id, name, email, hashedPass, phone, false, verificationToken, verificationExpires]'
  },
  { path: 'src/app/api/support/route.js',
    oldStr: 'INSERT INTO restaurant_support_tickets (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *',
    newStr: 'INSERT INTO restaurant_support_tickets (tenant_id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    oldParams: '[name, email, subject, message]',
    newParams: '[tenant_id, name, email, subject, message]'
  },
  { path: 'src/app/api/review/route.js',
    oldStr: 'INSERT INTO restaurant_reviews (name, email, comment, rating) VALUES ($1, $2, $3, $4) RETURNING *',
    newStr: 'INSERT INTO restaurant_reviews (tenant_id, name, email, comment, rating) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    oldParams: '[name, email, comment, rating]',
    newParams: '[tenant_id, name, email, comment, rating]'
  },
  { path: 'src/app/api/expense/route.js',
    oldStr: 'INSERT INTO restaurant_expenses (title, note, amount, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
    newStr: 'INSERT INTO restaurant_expenses (tenant_id, title, note, amount, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    oldParams: '[title, note, amount, user.id]',
    newParams: '[tenant_id, title, note, amount, user.id]'
  },
  { path: 'src/app/api/reservation/route.js',
    oldStr: 'INSERT INTO restaurant_reservations (name, email, res_date, member_count, table_no, message)',
    newStr: 'INSERT INTO restaurant_reservations (tenant_id, name, email, res_date, member_count, table_no, message)',
    oldParams: 'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    newParams: 'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    oldParams2: '[name, email, date, member, table, message || \"\"]',
    newParams2: '[tenant_id, name, email, date, member, table, message || \"\"]'
  }
];

files.forEach(f => {
  let content = fs.readFileSync(f.path, 'utf8');
  content = content.replace(f.oldStr, f.newStr);
  if (f.oldParams2) {
     content = content.replace(f.oldParams, f.newParams);
     content = content.replace(f.oldParams2, f.newParams2);
  } else {
     content = content.replace(f.oldParams, f.newParams);
  }
  fs.writeFileSync(f.path, content);
  console.log('Updated ' + f.path);
});
