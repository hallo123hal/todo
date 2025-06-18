module.exports = {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Disallow console.log statements',
        category: 'Best Practices',
        recommended: true,
      },
      fixable: 'code',
      messages: {
        unexpected: 'Unexpected console statement.',
        unexpectedMethod: 'Unexpected console.{{method}} statement.'
      }
    },
    
    // gọi mỗi lần lint, trả về đối tượng chứa các selector, nơi ESLint sẽ gọi hàm và duyệt
    create: function(context) {
      // kiểm tra một node (AST) có phải gọi tới console không
      function isConsoleCall(node) {
        return node.type === 'MemberExpression' &&
               node.object &&
               node.object.type === 'Identifier' &&
               node.object.name === 'console';
      }
  
      function getConsoleMethod(node) {
        if (node.property && node.property.type === 'Identifier') {
          return node.property.name;
        }
        return null;
      }
      
      // hàm báo lỗi
      function reportConsoleUsage(node, method) {
        var messageId = 'unexpected';
        var data = {};
  
        if (method) {
          messageId = 'unexpectedMethod';
          data.method = method;
        }
  
        context.report({
          node: node,
          messageId: messageId,
          data: data,
          // fix lỗi bằng cách xóa toàn bộ câu lệnh
          fix: function(fixer) {
            var parent = node.parent;
            while (parent && parent.type !== 'ExpressionStatement') {
              parent = parent.parent;
            }
            
            if (parent && parent.type === 'ExpressionStatement') {
              return fixer.remove(parent);
            }
            
            return fixer.remove(node.parent);
          }
        });
      }
      
      // trả về đối tượng chứa listeners cho các loại node AST
      return {
        // gọi khi gặp CallExpression
        'CallExpression': function(node) {
          // hàm được gọi (node.callee) là lời gọi tới đối tượng console => lấy tên phương thức + báo lỗi
          if (isConsoleCall(node.callee)) {
            var method = getConsoleMethod(node.callee);
            reportConsoleUsage(node, method);
          }
        },
        
        // gọi khi gặp MemberExpression
        'MemberExpression': function(node) {
          // đảm bảo liên quan tới console
          // đảm bảo không là một phần của CallExpression lớn hơn (tránh báo lỗi 2 lần vì đã xử lý ở trên)
          // tránh báo lỗi khi được truy cập nhưng không gọi
          if (isConsoleCall(node) && 
              node.parent.type !== 'CallExpression' && 
              node.parent.type !== 'MemberExpression') {
            
            var method = getConsoleMethod(node);
            
            context.report({
              node: node,
              messageId: 'unexpected',
              data: { method: method || 'unknown' }
            });
          }
        }
      };
    }
  };