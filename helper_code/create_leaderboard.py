import json
import os
import glob

def generate_leaderboard_html(json_file_path, visualizations_path=None):
    """
    Generate HTML table rows for the leaderboard from JSON data
    """
    
    # Load the JSON data
    with open(json_file_path, 'r') as file:
        data = json.load(file)
    
    # Extract the leaderboard data (assuming first key contains the leaderboard)
    leaderboard_key = list(data.keys())[0]
    leaderboard_data = data[leaderboard_key]
    
    html_rows = []
    rank = 1
    
    for team_name_full, scores in leaderboard_data.items():
        # Remove the number from the team name (everything after the last hyphen)
        team_name = team_name_full.rsplit('-', 1)[0] if '-' in team_name_full else team_name_full
        
        # Extract the average accuracy (main score)
        avg_accuracy_key = None
        for key in scores.keys():
            if "Average Accuracy" in key:
                avg_accuracy_key = key
                break
        
        if avg_accuracy_key:
            challenge_score = float(scores[avg_accuracy_key])
            # Convert to percentage and format to 4 decimal places
            challenge_score_formatted = f"{challenge_score:.4f}"
        else:
            challenge_score_formatted = "N/A"
        
        # Handle visualization link
        visualization_link = ""
        if visualizations_path and os.path.exists(visualizations_path):
            # Look for visualization file with the full team name
            pattern = os.path.join(visualizations_path, f"{team_name_full}.*")
            matching_files = glob.glob(pattern)
            
            if matching_files:
                # Use the first matching file
                visualization_file = os.path.basename(matching_files[0])
                visualization_link = f'<a href="{visualizations_path}/{visualization_file}" class="a-2021">Visualization</a>'
        else:
            # Use placeholder link if no path provided
            visualization_link = f'<a href="{visualizations_path}/{team_name_full}.jpg" class="a-2021">Visualization</a>'
        
        # Generate row HTML
        if rank <= 3:  # Top 3 get bold formatting
            row_html = f'''<tr>
<td><b>{rank}</b></td>
<td><b>{team_name}</b></td>
<td class="table-emphasis">{challenge_score_formatted}</td>
<td></td>
<td></td>
<td>{visualization_link}</td>
</tr>'''
        else:
            row_html = f'''<tr>
<td>{rank}</td>
<td>{team_name}</td>
<td class="table-emphasis">{challenge_score_formatted}</td>
<td></td>
<td></td>
<td>{visualization_link}</td>
</tr>'''
        
        html_rows.append(row_html)
        rank += 1
    
    return '\n'.join(html_rows)

# Example usage:
if __name__ == "__main__":
    # Replace 'leaderboard_data.json' with your actual JSON file path
    json_file = '/Users/domenicbersch/Documents/Repositories/Algonauts_2025_Website/helper_code/leaderboard_p2.json'
    
    # Optionally provide path to visualizations folder
    visualizations_folder = 'visualizations_2025_p2'  # Set to None to use placeholder links
    
    # Generate and print only the table rows
    table_rows = generate_leaderboard_html(json_file, visualizations_folder)
    print(table_rows)