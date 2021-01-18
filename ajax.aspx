<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Call C# method/function using JQuery Ajax</title>

    <script src="Script/jquery-1.11.0.min.js" type="text/javascript"></script>

    <script type="text/javascript" language="javascript" src="extension.js">

        function JqueryAjaxCall() {
            var pageUrl = '<%= ResolveUrl("~/Default.aspx/jqueryAjaxCall") %>';
            var firstName = $("#<%= extension.js.userEmail %>").val();
            var lastName = $("#<%= txtLastName.ClientID %>").val();
            var parameter = { "firstName": firstName, "lastName": lastName }

            $.ajax({
                type: 'POST',
                url: pageUrl,
                data: JSON.stringify(parameter),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function(data) {
                    onSuccess(data);
                },
                error: function(data, success, error) {
                    alert("Error : " + error);
                }
            });

            return false;
        }

        function onSuccess(data) {
            alert(data.d);
        }
    
    </script>

</head>
<body>
    <form id="form1" runat="server">
    <div>
        <table cellpadding="3" cellspacing="0" style="width: 25%;">
            <tr>
                <td>
                    First Name:
                </td>
                <td>
                    <asp:TextBox ID="txtFirstName" runat="server"></asp:TextBox>
                </td>
            </tr>
            <tr>
                <td>
                    Last Name:
                </td>
                <td>
                    <asp:TextBox ID="txtLastName" runat="server"></asp:TextBox>
                </td>
            </tr>
            <tr>
                <td>
                </td>
                <td>
                </td>
            </tr>
            <tr>
                <td>
                </td>
                <td>
                    <asp:Button ID="btnSubmit" runat="server" OnClientClick="return JqueryAjaxCall();"
                        Text="Submit" />
                </td>
            </tr>
        </table>
    </div>
    </form>
</body>
</html>
