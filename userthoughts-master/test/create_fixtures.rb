# Saves the markup to a fixture file using the given name
def save_fixture
  File.open("test/support/fixtures.js","w") do | file|
    fixture_str = <<fixture
    function loadFixture(){
      $('body').html('');
      /*:DOC += #{IO.read("UTExtension/background.html")}*/
    }
fixture
    file.puts fixture_str
  end
end
puts "creating fixtures"
save_fixture
  

